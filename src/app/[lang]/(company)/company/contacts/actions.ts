'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getContacts(search?: string, filter?: string) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return [];
    }

    const where: any = {
        companyId: session.user.companyId,
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (filter === 'active') {
        // Active contacts = contacts with OPEN conversations
        where.conversations = {
            some: {
                status: 'OPEN'
            }
        };
    }

    return prisma.contact.findMany({
        where,
        include: {
            tags: true,
            _count: {
                select: { conversations: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function createContact(data: {
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    city?: string;
    country?: string;
}) {
    const session = await auth();
    if (!session?.user?.companyId) {
        throw new Error("Unauthorized");
    }

    const contact = await prisma.contact.create({
        data: {
            ...data,
            companyId: session.user.companyId,
        }
    });

    revalidatePath('/[lang]/company/contacts', 'page');
    return contact;
}
