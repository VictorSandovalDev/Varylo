'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Plan, CompanyStatus } from '@prisma/client';

const createCompanySchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    plan: z.nativeEnum(Plan),
    status: z.nativeEnum(CompanyStatus),
});

export async function createCompany(data: z.infer<typeof createCompanySchema>) {
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
