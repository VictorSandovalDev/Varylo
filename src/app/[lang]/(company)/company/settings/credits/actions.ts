'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getCreditTransactions(page: number = 1, limit: number = 20) {
    const session = await auth();
    const companyId = session?.user?.companyId;
    if (!companyId) return { transactions: [], total: 0 };

    const [transactions, total] = await Promise.all([
        prisma.creditTransaction.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.creditTransaction.count({
            where: { companyId },
        }),
    ]);

    return {
        transactions: transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            balanceAfter: t.balanceAfter,
            description: t.description,
            createdAt: t.createdAt.toISOString(),
        })),
        total,
    };
}
