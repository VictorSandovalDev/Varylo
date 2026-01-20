'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role, ChannelType } from '@prisma/client';

export async function toggleConversationTag(conversationId: string, tagId: string) {
    const session = await auth();
    if (!session?.user?.companyId) {
        throw new Error("Unauthorized");
    }

    // Verify conversation ownership
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, companyId: session.user.companyId },
        include: { tags: true }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // Verify tag ownership (optional but good practice)
    const tag = await prisma.tag.findUnique({
        where: { id: tagId, companyId: session.user.companyId }
    });
    if (!tag) {
        throw new Error("Tag not found");
    }

    const hasTag = conversation.tags.some(t => t.id === tagId);

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            tags: hasTag
                ? { disconnect: { id: tagId } }
                : { connect: { id: tagId } }
        }
    });

    revalidatePath('/[lang]/company/conversations', 'page');
    revalidatePath('/[lang]/agent', 'page');
}

export async function toggleConversationAgent(conversationId: string, agentId: string) {
    const session = await auth();
    if (!session?.user?.companyId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, companyId: session.user.companyId },
        include: { assignedAgents: true }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const isAssigned = conversation.assignedAgents.some(a => a.id === agentId);

    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            assignedAgents: isAssigned
                ? { disconnect: { id: agentId } }
                : { connect: { id: agentId } }
        }
    });

    revalidatePath('/[lang]/company/conversations', 'page');
    revalidatePath('/[lang]/agent', 'page');
}

export async function updatePriority(conversationId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') {
    const session = await auth();
    if (!session?.user?.companyId) {
        throw new Error("Unauthorized");
    }

    await prisma.conversation.update({
        where: { id: conversationId, companyId: session.user.companyId },
        data: { priority }
    });

    revalidatePath('/[lang]/company/conversations', 'page');
    revalidatePath('/[lang]/agent', 'page');
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.companyId) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                contact: true,
                channel: true,
            }
        });

        if (!conversation) {
            return { success: false, message: "Conversation not found" };
        }

        // Send to external provider
        if (conversation.channel.type === ChannelType.INSTAGRAM) {
            const config = conversation.channel.configJson as { accessToken?: string; pageId?: string } | null;
            if (config?.accessToken) {
                const { sendInstagramMessageWithToken } = await import('@/lib/instagram');
                // Pass the stored "Page ID" (which we instructed user to be the IG Business ID 1784...)
                await sendInstagramMessageWithToken(conversation.contact.phone, content, config.accessToken, config.pageId);
            }
        } else if (conversation.channel.type === ChannelType.WHATSAPP) {
            const { sendWhatsAppMessage } = await import('@/lib/whatsapp');
            await sendWhatsAppMessage(conversation.contact.phone, content);
        }

        await prisma.message.create({
            data: {
                content,
                conversationId,
                companyId: session.user.companyId,
                senderId: session.user.id,
                direction: 'OUTBOUND',
                from: session.user.name || 'Agent',
                to: conversation.contact?.phone || 'Unknown',
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), updatedAt: new Date() }
        });

        revalidatePath('/[lang]/company/conversations', 'page');
        revalidatePath('/[lang]/agent', 'page');
        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, message: "Failed to send message" };
    }
}

export async function deleteConversation(conversationId: string) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: "Unauthorized" };
    }

    if (session.user.role === Role.AGENT) {
        return { success: false, message: "Agents cannot delete conversations" };
    }

    try {
        await prisma.conversation.delete({
            where: { id: conversationId, companyId: session.user.companyId }
        });

        revalidatePath('/[lang]/company/conversations', 'page');
        revalidatePath('/[lang]/agent', 'page');
        return { success: true };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { success: false, message: "Failed to delete conversation" };
    }
}
