'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTags() {
    const session = await auth();
    if (!session?.user?.companyId) return [];

    return await prisma.tag.findMany({
        where: {
            companyId: session.user.companyId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function createTag(data: { name: string; description?: string; color: string; showInSidebar: boolean }) {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error("Unauthorized");

    try {
        await prisma.tag.create({
            data: {
                companyId: session.user.companyId,
                name: data.name,
                description: data.description,
                color: data.color,
                showInSidebar: data.showInSidebar
            }
        });
        revalidatePath('/company/settings/tags');
        revalidatePath('/company/conversations'); // Revalidate in case it appears on sidebar
        return { success: true };
    } catch (error) {
        console.error("Failed to create tag:", error);
        return { success: false, error: "Failed to create tag" };
    }
}
