import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Find the best agent to assign a new conversation to.
 * Strategy: pick the active agent with the fewest OPEN conversations.
 * If no agents exist, fall back to the COMPANY_ADMIN.
 */
export async function findLeastBusyAgent(companyId: string): Promise<string | null> {
    // Get all active agents with their open conversation count
    const agents = await prisma.user.findMany({
        where: {
            companyId,
            active: true,
            role: Role.AGENT,
        },
        select: {
            id: true,
            _count: {
                select: {
                    assignedConversations: {
                        where: { status: 'OPEN' },
                    },
                },
            },
        },
    });

    if (agents.length > 0) {
        // Sort by fewest open conversations, pick the first
        agents.sort((a, b) => a._count.assignedConversations - b._count.assignedConversations);
        return agents[0].id;
    }

    // No agents — fall back to COMPANY_ADMIN
    const admin = await prisma.user.findFirst({
        where: {
            companyId,
            active: true,
            role: Role.COMPANY_ADMIN,
        },
        select: { id: true },
    });

    return admin?.id || null;
}
