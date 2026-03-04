'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Plan, Role } from '@prisma/client';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const registerSchema = z.object({
    companyName: z.string().min(1).max(200).trim(),
    name: z.string().min(1).max(100).trim(),
    email: z.string().email().max(254),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
    confirmPassword: z.string(),
    plan: z.nativeEnum(Plan),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export async function register(
    _prevState: { success?: boolean; error?: string } | undefined,
    formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
    // Rate limit: 5 registrations per 10 minutes per IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown';
    const rl = checkRateLimit(ip, { prefix: 'register', limit: 5, windowSeconds: 600 });
    if (!rl.success) {
        return { error: 'Demasiados intentos de registro. Intenta de nuevo más tarde.' };
    }

    const parsed = registerSchema.safeParse({
        companyName: formData.get('companyName'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        plan: formData.get('plan') || 'STARTER',
    });

    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message;
        return { error: firstError || 'Datos inválidos.' };
    }

    const { companyName, name, email, password, plan } = parsed.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: 'Email already in use.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    name: companyName,
                    plan: plan,
                    status: 'ACTIVE',
                },
            });

            await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role: Role.COMPANY_ADMIN,
                    companyId: company.id,
                },
            });
        });
    } catch (err) {
        console.error(err);
        return { error: 'Failed to create account.' };
    }

    try {
        await sendWelcomeEmail(email, name, companyName);
    } catch (err) {
        console.error('[Welcome Email] Failed:', err);
    }

    return { success: true };
}
