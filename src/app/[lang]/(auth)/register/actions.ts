'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { Plan, Role } from '@prisma/client';

export async function register(prevState: string | undefined, formData: FormData) {
    const companyName = formData.get('companyName') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const plan = formData.get('plan') as Plan;

    if (!companyName || !name || !email || !password || !plan) {
        return 'All fields are required.';
    }

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return 'Email already in use.';
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // 3. Create Company and User in transaction
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
        return 'Failed to create account.';
    }

    redirect('/login');
}
