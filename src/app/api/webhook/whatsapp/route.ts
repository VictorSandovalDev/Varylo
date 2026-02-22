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

    // 1. Check strict environment variable first (optional fallback)
    const envVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'varylo_verify_token';
    if (token === envVerifyToken) {
        return new NextResponse(challenge, { status: 200 });
    }

    // 2. Check against database channels
    try {
        // We need to find if ANY channel has this verify token in its config
        // Since configJson is a JSON field, the query strategy depends on the DB capability.
        // For broad compatibility in MVP or if using generic JSON, we might fetch all WhatsApp channels
        // or attempt a raw query. 
        // Given the scale of MVP, fetching all active WhatsApp channels is acceptable but risky for scale.
        // Ideally: strict raw query or JSON filter.

        // Using Prisma's findFirst with raw JSON filtering is cleaner if supported, 
        // but for safety in this context let's try a direct approach.

        const matchingChannel = await prisma.channel.findFirst({
            where: {
                type: ChannelType.WHATSAPP,
                // Prisma JSON filtering syntax:
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

        // Check if it's a WhatsApp status update or message
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
            const message = value.messages[0];
            const from = message.from; // Phone number
            const text = message.text?.body;
            const messageId = message.id;
            const phoneNumberId = value.metadata?.phone_number_id;

            if (!text || !phoneNumberId) return NextResponse.json({ status: 'ignored' });

            // Find the channel (company) associated with this phone number ID
            // Note: We stored configJson in Channel. We need to query channels and check the config.
            // This is inefficient loop, better to store phoneNumberId in a specific field or use JSON query if DB supports.
            // Postgres supports JSON query.

            // Assume we can find the channel. For MVP, we'll try to find a channel where configJson->>'phoneNumberId' equals phoneNumberId
            // Prisma raw query or filtered findMany.
            // Since it's MVP, let's just use findFirst with manual filter or assume we have one main channel for demo.
            // Or simple raw query.

            const channels = await prisma.channel.findMany({
                where: { type: ChannelType.WHATSAPP }
            });

            const channel = channels.find((c) => {
                const config = c.configJson as { phoneNumberId?: string } | null;
                return config?.phoneNumberId === phoneNumberId;
            });

            if (channel) {
                const companyId = channel.companyId;

                // Find or create Contact
                let contact = await prisma.contact.findFirst({
                    where: { companyId, phone: from }
                });

                if (!contact) {
                    contact = await prisma.contact.create({
                        data: {
                            companyId,
                            phone: from,
                            name: value.contacts?.[0]?.profile?.name || from
                        }
                    });
                }

                // Find or create Conversation
                // Should find open conversation
                let conversation = await prisma.conversation.findFirst({
                    where: {
                        companyId,
                        contactId: contact.id,
                        status: 'OPEN'
                    }
                });

                if (!conversation) {
                    // Check if there's an active AI agent or chatbot for this channel
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
                        // Fallback: assign to random human agent
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
                        from: from,
                        to: phoneNumberId,
                        content: text,
                        providerMessageId: messageId,
                    }
                });

                // Pipeline: Chatbot → AI Agent → Analysis
                (async () => {
                    try {
                        // 1. Try chatbot first
                        const chatbotResult = await handleChatbotResponse(conversation.id, text);
                        if (chatbotResult.handled) {
                            if (chatbotResult.transferToAi) {
                                // Fall through to AI agent
                            } else {
                                return; // Chatbot handled it
                            }
                        }

                        // 2. Try AI agent
                        const aiResult = await handleAiAgentResponse(conversation.id, text);
                        if (aiResult.handled) return;

                        // 3. Fallback to analysis
                        await analyzeConversation(conversation.id);
                    } catch (err) {
                        console.error('[Pipeline] WhatsApp processing error:', err);
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
