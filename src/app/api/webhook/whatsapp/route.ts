import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChannelType, MessageDirection } from '@prisma/client';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'varylo_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
        return new NextResponse(challenge, { status: 200 });
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
                    conversation = await prisma.conversation.create({
                        data: {
                            companyId,
                            channelId: channel.id,
                            contactId: contact.id,
                            status: 'OPEN'
                        }
                    });
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
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
