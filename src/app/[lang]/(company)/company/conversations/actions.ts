'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { analyzeConversation } from '@/jobs/ai';
import { sendChannelMessage } from '@/lib/channel-sender';

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

    // Verify conversation ownership
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, companyId: session.user.companyId },
        include: { assignedAgents: true }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // Verify agent belongs to same company
    const agent = await prisma.user.findFirst({
        where: { id: agentId, companyId: session.user.companyId, role: Role.AGENT },
    });
    if (!agent) {
        throw new Error("Agent not found");
    }

    const isAssigned = conversation.assignedAgents.some(a => a.id === agentId);

    await prisma.conversation.update({
        where: { id: conversationId, companyId: session.user.companyId },
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
        await sendChannelMessage({
            conversationId,
            companyId: session.user.companyId,
            content,
            fromName: session.user.name || 'Agent',
        });

        // Fire-and-forget AI analysis
        analyzeConversation(conversationId).catch((err) =>
            console.error('[AI] sendMessage analysis error:', err)
        );

        revalidatePath('/[lang]/company/conversations', 'page');
        revalidatePath('/[lang]/agent', 'page');
        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        const msg = error instanceof Error ? error.message : "Failed to send message";
        return { success: false, message: msg };
    }
}

export async function reanalyzeConversation(conversationId: string) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: "Unauthorized" };
    }

    // Verify ownership
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, companyId: session.user.companyId },
    });

    if (!conversation) {
        return { success: false, message: "Conversation not found" };
    }

    const result = await analyzeConversation(conversationId);

    revalidatePath('/[lang]/company/conversations', 'page');
    return { success: !!result };
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

export async function deleteConversations(conversationIds: string[]) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: "Unauthorized" };
    }

    if (session.user.role === Role.AGENT) {
        return { success: false, message: "Agents cannot delete conversations" };
    }

    if (!conversationIds.length) {
        return { success: false, message: "No conversations selected" };
    }

    try {
        await prisma.conversation.deleteMany({
            where: {
                id: { in: conversationIds },
                companyId: session.user.companyId,
            }
        });

        revalidatePath('/[lang]/company/conversations', 'page');
        revalidatePath('/[lang]/agent', 'page');
        return { success: true, count: conversationIds.length };
    } catch (error) {
        console.error("Error deleting conversations:", error);
        return { success: false, message: "Failed to delete conversations" };
    }
}
