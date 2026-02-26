'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function updateUserStatus(status: 'ONLINE' | 'BUSY' | 'OFFLINE') {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await prisma.user.update({
        where: { id: session.user.id },
        data: { status, lastSeenAt: new Date() },
    });

    return { success: true };
}

export async function getUserStatus() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true },
    });

    return user?.status || 'OFFLINE';
}
