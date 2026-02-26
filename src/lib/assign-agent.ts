import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Find the best user to assign a new conversation to.
 * Strategy: pick the active user (AGENT or COMPANY_ADMIN) with the
 * fewest OPEN conversations assigned, distributing the load evenly.
 */
export async function findLeastBusyAgent(companyId: string): Promise<string | null> {
    // Get all active agents AND admins with their open conversation count
    const users = await prisma.user.findMany({
        where: {
            companyId,
            active: true,
            role: { in: [Role.AGENT, Role.COMPANY_ADMIN] },
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

    if (users.length === 0) return null;

    // Sort by fewest open conversations, pick the least busy
    users.sort((a, b) => a._count.assignedConversations - b._count.assignedConversations);
    return users[0].id;
}
