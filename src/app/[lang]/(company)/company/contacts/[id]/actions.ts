'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getContact(id: string) {
    const session = await auth();
    if (!session?.user?.companyId) return null;

    const contact = await prisma.contact.findFirst({
        where: {
            id,
            companyId: session.user.companyId,
        },
        include: {
            tags: true,
            conversations: {
                select: {
                    id: true,
                    status: true,
                    lastMessageAt: true,
                    channel: { select: { type: true } },
                },
                orderBy: { lastMessageAt: 'desc' },
            },
        },
    });

    if (!contact) return null;

    const capturedData = await prisma.capturedData.findMany({
        where: { contactId: id, companyId: session.user.companyId },
        orderBy: { createdAt: 'asc' },
    }).catch(() => []);

    return { ...contact, capturedData };
}

export async function updateContact(
    id: string,
    data: {
        name?: string;
        email?: string;
        companyName?: string;
        city?: string;
        country?: string;
    }
) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        await prisma.contact.update({
            where: {
                id,
                companyId: session.user.companyId,
            },
            data,
        });

        revalidatePath('/[lang]/company/contacts', 'page');
        revalidatePath(`/[lang]/company/contacts/${id}`, 'page');
        return { success: true };
    } catch (error) {
        console.error('Error updating contact:', error);
        return { success: false, message: 'Error al actualizar el contacto' };
    }
}
