import { prisma } from '@/lib/prisma';
import { ChannelType, MessageDirection } from '@prisma/client';
import { sendInstagramMessageWithToken } from '@/lib/instagram';

interface SendMessageOptions {
    conversationId: string;
    companyId: string;
    content: string;
    fromName?: string;
}

export async function sendChannelMessage({ conversationId, companyId, content, fromName }: SendMessageOptions) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            contact: true,
            channel: true,
        },
    });

    if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
    }

    const { channel, contact } = conversation;

    if (channel.type === ChannelType.WHATSAPP) {
        const config = channel.configJson as { phoneNumberId?: string; accessToken?: string } | null;
        if (config?.accessToken && config?.phoneNumberId) {
            const res = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: contact.phone,
                    text: { body: content },
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errorMsg = (errorData as any)?.error?.message || `HTTP ${res.status}`;
                console.error(`[WhatsApp] Failed to send message to ${contact.phone}:`, errorMsg);
                throw new Error(`WhatsApp API error: ${errorMsg}`);
            }
        } else {
            console.error('[WhatsApp] Channel missing accessToken or phoneNumberId');
            throw new Error('WhatsApp channel not configured');
        }
    } else if (channel.type === ChannelType.INSTAGRAM) {
        const config = channel.configJson as { accessToken?: string; pageId?: string } | null;
        if (config?.accessToken) {
            const result = await sendInstagramMessageWithToken(contact.phone, content, config.accessToken, config.pageId);
            if (!result.success) {
                throw new Error(`Instagram API error: ${result.message}`);
            }
        } else {
            console.error('[Instagram] Channel missing accessToken');
            throw new Error('Instagram channel not configured');
        }
    }

    // Save the message in DB
    await prisma.message.create({
        data: {
            companyId,
            conversationId,
            direction: MessageDirection.OUTBOUND,
            from: fromName || 'AI',
            to: contact.phone,
            content,
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });
}
