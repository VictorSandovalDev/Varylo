'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { auth } from '@/auth';
import type { FooterSection } from '@/lib/site-config';

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    if (user?.role !== Role.SUPER_ADMIN) throw new Error('Forbidden');
    return session;
}

export async function ensureSiteConfigTable() {
    await requireSuperAdmin();
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SiteConfig" (
                "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
                "faviconUrl" TEXT,
                "footerSections" JSONB,
                "copyrightText" TEXT,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
            )
        `);
        return { success: true };
    } catch (error) {
        console.error('Error creating SiteConfig table:', error);
        return { success: false, error: 'Error al crear la tabla SiteConfig' };
    }
}

export async function getSiteConfigAction() {
    await requireSuperAdmin();
    try {
        const config = await prisma.siteConfig.findFirst();
        return {
            success: true,
            data: config
                ? {
                    footerSections: config.footerSections as FooterSection[] | null,
                    copyrightText: config.copyrightText,
                }
                : null,
        };
    } catch {
        return { success: true, data: null };
    }
}

export async function updateFooterAction(
    footerSections: FooterSection[],
    copyrightText: string
) {
    await requireSuperAdmin();
    try {
        const existing = await prisma.siteConfig.findFirst();
        if (existing) {
            await prisma.siteConfig.update({
                where: { id: existing.id },
                data: { footerSections: footerSections as any, copyrightText },
            });
        } else {
            await prisma.siteConfig.create({
                data: { footerSections: footerSections as any, copyrightText },
            });
        }
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error updating footer:', error);
        return { success: false, error: 'Error al actualizar el footer' };
    }
}
