import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChannelType, MessageDirection, Role } from '@prisma/client';
import { analyzeConversation } from '@/jobs/ai';
import { handleAiAgentResponse } from '@/jobs/ai-agent';
import { handleChatbotResponse } from '@/jobs/chatbot';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode !== 'subscribe' || !token || !challenge) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // Use a global verify token for the SaaS App with OAuth
    const GLOBAL_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'varylo_default_verify_token';

    if (token === GLOBAL_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }

    // Fallback: Check if it matches any channel legacy token (optional, but good for transition)
    try {
        const matchingChannel = await prisma.channel.findFirst({
            where: {
                type: ChannelType.INSTAGRAM,
                configJson: {
                    path: ['verifyToken'],
                    equals: token
                }
            }
        });

        if (matchingChannel) {
            return new NextResponse(challenge, { status: 200 });
        }
    } catch (error) {
        console.error('Error verifying webhook token:', error);
    }

    return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check format
        const entry = body.entry?.[0];
        const messaging = entry?.messaging?.[0];
        // Instagram sometimes sends 'messaging' array inside entry. 
        // Or if it's a Page subscription, it might look like: entry[0].changes[0].value... or entry[0].messaging...
        // For Instagram Messaging, it's typically:
        // entry: [{ id: "PAGE_ID", messaging: [{ sender: {id: "USER_ID"}, recipient: {id: "PAGE_ID"}, message: {...} }] }]

        // Let's handle both standard messaging and changes (just in case)
        const messageEvent = messaging || (entry?.changes?.[0]?.value?.messages?.[0] ? {
            sender: { id: entry.changes[0].value.messages[0].from },
            recipient: { id: entry.changes[0].value.metadata.phone_number_id }, // wait, this is whatsapp structure.
            message: {
                text: entry.changes[0].value.messages[0].text.body,
                mid: entry.changes[0].value.messages[0].id
            }
        } : null);

        // Actually, Instagram Messaging webhook payload for Direct Messages:
        // entry: [ { id: "IG_USER_ID_OF_PAGE", time: ..., messaging: [ { sender: {id: "IG_SID"}, recipient: {id: "IG_USER_ID_OF_PAGE"}, message: { mid: "...", text: "..." } } ] } ]

        if (messaging && messaging.message) {
            const senderId = messaging.sender.id;
            const recipientId = messaging.recipient.id; // This is the Page's IG User ID
            const text = messaging.message.text;
            const messageId = messaging.message.mid;

            if (!text || !recipientId) return NextResponse.json({ status: 'ignored' });

            // Find the channel (company) associated with this Recipient ID (Page's IG ID)
            // We search channels where configJson->>'pageId' equals recipientId OR configJson->>'instagramId'

            // Note: In our form, we should capture this ID.

            const channels = await prisma.channel.findMany({
                where: { type: ChannelType.INSTAGRAM }
            });

            const channel = channels.find((c) => {
                const config = c.configJson as { pageId?: string; instagramId?: string } | null;
                // We might term it 'pageId' or 'instagramId' in the form. Let's assume 'pageId' for now as generic ID.
                return config?.pageId === recipientId || config?.instagramId === recipientId;
            });

            if (channel) {
                const companyId = channel.companyId;

                // Find or create Contact
                let contact = await prisma.contact.findFirst({
                    where: { companyId, phone: senderId } // Storing IG SID in 'phone' for MVP uniqueness, or add a new field.
                    // 'phone' is a required string. Using it for external IDs is a common hack in MVPs.
                });

                if (!contact) {
                    contact = await prisma.contact.create({
                        data: {
                            companyId,
                            phone: senderId, // Storing IG SID
                            name: "Instagram User", // We could fetch profile info if we had token
                            companyName: "Instagram"
                        }
                    });
                }

                // Find or create Conversation
                let conversation = await prisma.conversation.findFirst({
                    where: {
                        companyId,
                        contactId: contact.id,
                        status: 'OPEN'
                    }
                });

                if (!conversation) {
                    // Check if there's an active AI agent for this channel
                    const activeAiAgent = await prisma.aiAgent.findFirst({
                        where: {
                            companyId,
                            active: true,
                            channels: { some: { id: channel.id } },
                        },
                    });

                    if (activeAiAgent) {
                        conversation = await prisma.conversation.create({
                            data: {
                                companyId,
                                channelId: channel.id,
                                contactId: contact.id,
                                status: 'OPEN',
                                handledByAiAgentId: activeAiAgent.id,
                            },
                        });
                    } else {
                        let selectedAgentId: string | null = null;

                        const agents = await prisma.user.findMany({
                            where: {
                                companyId,
                                active: true,
                                role: Role.AGENT,
                            },
                            select: { id: true },
                        });

                        if (agents.length > 0) {
                            const randomIndex = Math.floor(Math.random() * agents.length);
                            selectedAgentId = agents[randomIndex].id;
                        }

                        conversation = await prisma.conversation.create({
                            data: {
                                companyId,
                                channelId: channel.id,
                                contactId: contact.id,
                                status: 'OPEN',
                                assignedAgents: selectedAgentId ? {
                                    connect: { id: selectedAgentId },
                                } : undefined,
                            },
                        });
                    }
                }

                // Save Message
                await prisma.message.create({
                    data: {
                        companyId,
                        conversationId: conversation.id,
                        direction: MessageDirection.INBOUND,
                        from: senderId,
                        to: recipientId,
                        content: text,
                        providerMessageId: messageId,
                    }
                });

                // Update conversation timestamps
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { lastMessageAt: new Date(), lastInboundAt: new Date() }
                });

                // Pipeline: Chatbot → AI Agent → Analysis
                (async () => {
                    try {
                        const chatbotResult = await handleChatbotResponse(conversation.id, text);
                        if (chatbotResult.handled) {
                            if (chatbotResult.transferToAi) {
                                // Fall through to AI agent
                            } else {
                                return;
                            }
                        }

                        const aiResult = await handleAiAgentResponse(conversation.id, text);
                        if (aiResult.handled) return;

                        await analyzeConversation(conversation.id);
                    } catch (err) {
                        console.error('[Pipeline] Instagram processing error:', err);
                    }
                })();
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
