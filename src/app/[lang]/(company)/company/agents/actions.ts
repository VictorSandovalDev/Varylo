'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createAgent(prevState: string | undefined, formData: FormData) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return 'Error: All fields are required.';
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return 'Error: User with this email already exists.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: Role.AGENT,
                companyId: session.user.companyId,
            },
        });

        revalidatePath('/[lang]/company/agents', 'page');
        return 'Success: Agent created successfully.';
    } catch (error) {
        console.error('Failed to create agent:', error);
        return 'Error: Failed to create agent.';
    }
}

export async function updateAgent(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!id || !name || !email) return 'Error: All fields are required.';

    try {
        await prisma.user.update({
            where: { id, companyId: session.user.companyId }, // Ensure ownership
            data: { name, email },
        });

        revalidatePath('/[lang]/company/agents', 'page');
        return 'Success: Agent updated successfully.';
    } catch (error) {
        console.error('Failed to update agent:', error);
        return 'Error: Failed to update agent.';
    }
}

export async function toggleAgentStatus(id: string, isActive: boolean) {
    const session = await auth();
    console.log('[toggleAgentStatus] Session:', session?.user);

    if (!session?.user?.companyId) {
        console.error('[toggleAgentStatus] No companyId in session');
        throw new Error('Unauthorized');
    }

    try {
        console.log(`[toggleAgentStatus] Toggling user ${id} to ${isActive} for company ${session.user.companyId}`);
        await prisma.user.update({
            where: { id, companyId: session.user.companyId },
            data: { active: isActive },
        });
        console.log('[toggleAgentStatus] Success');
        revalidatePath('/[lang]/company/agents', 'page');
    } catch (error) {
        console.error('[toggleAgentStatus] Failed:', error);
        throw error;
    }
}

export async function deleteAgent(id: string) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    try {
        await prisma.user.delete({
            where: {
                id,
                companyId: session.user.companyId, // Ensure ownership
                role: Role.AGENT // Security: Prevent deleting admins via this action
            },
        });

        revalidatePath('/[lang]/company/agents', 'page');
        return 'Success: Agent deleted successfully.';
    } catch (error) {
        console.error('Failed to delete agent:', error);
        return 'Error: Failed to delete agent.';
    }
}
