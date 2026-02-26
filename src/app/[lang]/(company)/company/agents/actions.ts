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
    if (!session?.user?.companyId) {
        throw new Error('Unauthorized');
    }

    // Only COMPANY_ADMIN can toggle agent status
    if (session.user.role === Role.AGENT) {
        throw new Error('Agents cannot modify other agents');
    }

    try {
        await prisma.user.update({
            where: { id, companyId: session.user.companyId, role: Role.AGENT },
            data: { active: isActive },
        });
        revalidatePath('/[lang]/company/agents', 'page');
    } catch (error) {
        throw new Error('Failed to update agent status');
    }
}

export async function deleteAgent(id: string) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    // Only COMPANY_ADMIN can delete agents
    if (session.user.role === Role.AGENT) {
        return 'Error: Agents cannot delete other agents.';
    }

    try {
        await prisma.user.delete({
            where: {
                id,
                companyId: session.user.companyId,
                role: Role.AGENT,
            },
        });

        revalidatePath('/[lang]/company/agents', 'page');
        return 'Success: Agent deleted successfully.';
    } catch {
        return 'Error: Failed to delete agent.';
    }
}
