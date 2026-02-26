'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Plan, CompanyStatus, CreditTransactionType, Role } from '@prisma/client';
import { addCredits } from '@/lib/credits';
import { auth } from '@/auth';

/** Verify caller is authenticated SUPER_ADMIN */
async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized: No session');
    }
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    if (user?.role !== Role.SUPER_ADMIN) {
        throw new Error('Forbidden: Super admin access required');
    }
    return session;
}

const createCompanySchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(200),
    plan: z.nativeEnum(Plan),
    status: z.nativeEnum(CompanyStatus),
});

export async function createCompany(data: z.infer<typeof createCompanySchema>) {
    await requireSuperAdmin();
    const result = createCompanySchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: 'Datos inválidos' };
    }

    try {
        const company = await prisma.company.create({
            data: {
                name: result.data.name,
                plan: result.data.plan,
                status: result.data.status,
            },
        });

        revalidatePath('/super-admin/companies');
        return { success: true, data: company };
    } catch (error) {
        console.error('Error creating company:', error);
        return { success: false, error: 'Error al crear la empresa' };
    }
}

const updateCompanySchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'El nombre es obligatorio'),
    plan: z.nativeEnum(Plan),
    status: z.nativeEnum(CompanyStatus),
});

export async function updateCompany(data: z.infer<typeof updateCompanySchema>) {
    await requireSuperAdmin();
    const result = updateCompanySchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: 'Datos inválidos' };
    }

    try {
        const company = await prisma.company.update({
            where: { id: result.data.id },
            data: {
                name: result.data.name,
                plan: result.data.plan,
                status: result.data.status,
            },
        });

        revalidatePath('/super-admin/companies');
        return { success: true, data: company };
    } catch (error) {
        console.error('Error updating company:', error);
        return { success: false, error: 'Error al actualizar la empresa' };
    }
}

const adjustCreditsSchema = z.object({
    companyId: z.string(),
    amount: z.number().int().refine(val => val !== 0, 'El monto no puede ser 0'),
    description: z.string().min(1, 'La descripción es obligatoria'),
});

export async function adjustCompanyCredits(data: z.infer<typeof adjustCreditsSchema>) {
    await requireSuperAdmin();
    const result = adjustCreditsSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: 'Datos inválidos' };
    }

    try {
        const res = await addCredits({
            companyId: result.data.companyId,
            amount: result.data.amount,
            type: CreditTransactionType.MANUAL_ADJUST,
            description: `Ajuste manual: ${result.data.description}`,
        });

        revalidatePath('/super-admin/companies');
        return { success: true, newBalance: res.newBalance };
    } catch (error) {
        console.error('Error adjusting credits:', error);
        return { success: false, error: 'Error al ajustar créditos' };
    }
}
