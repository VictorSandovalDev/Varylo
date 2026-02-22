'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAiAgent(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const name = formData.get('name') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const contextInfo = formData.get('contextInfo') as string;
    const model = formData.get('model') as string || 'gpt-4o-mini';
    const temperature = parseFloat(formData.get('temperature') as string) || 0.7;
    const transferKeywordsRaw = formData.get('transferKeywords') as string;
    const channelIds = formData.getAll('channelIds') as string[];

    if (!name || !systemPrompt) {
        return 'Error: Nombre y prompt del sistema son requeridos.';
    }

    const transferKeywords = transferKeywordsRaw
        ? transferKeywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
        : ['humano', 'agente', 'persona'];

    try {
        await prisma.aiAgent.create({
            data: {
                companyId: session.user.companyId,
                name,
                systemPrompt,
                contextInfo: contextInfo || null,
                model,
                temperature,
                transferKeywords,
                channels: channelIds.length > 0 ? {
                    connect: channelIds.map(id => ({ id })),
                } : undefined,
            },
        });

        revalidatePath('/[lang]/company/ai-agents', 'page');
        return 'Success: Agente IA creado correctamente.';
    } catch (error) {
        console.error('Failed to create AI agent:', error);
        return 'Error: No se pudo crear el agente IA.';
    }
}

export async function updateAiAgent(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const contextInfo = formData.get('contextInfo') as string;
    const model = formData.get('model') as string || 'gpt-4o-mini';
    const temperature = parseFloat(formData.get('temperature') as string) || 0.7;
    const transferKeywordsRaw = formData.get('transferKeywords') as string;
    const channelIds = formData.getAll('channelIds') as string[];

    if (!id || !name || !systemPrompt) return 'Error: Campos requeridos faltantes.';

    const transferKeywords = transferKeywordsRaw
        ? transferKeywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
        : ['humano', 'agente', 'persona'];

    try {
        await prisma.aiAgent.update({
            where: { id, companyId: session.user.companyId },
            data: {
                name,
                systemPrompt,
                contextInfo: contextInfo || null,
                model,
                temperature,
                transferKeywords,
                channels: {
                    set: channelIds.map(cid => ({ id: cid })),
                },
            },
        });

        revalidatePath('/[lang]/company/ai-agents', 'page');
        return 'Success: Agente IA actualizado correctamente.';
    } catch (error) {
        console.error('Failed to update AI agent:', error);
        return 'Error: No se pudo actualizar el agente IA.';
    }
}

export async function toggleAiAgent(id: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error('Unauthorized');

    await prisma.aiAgent.update({
        where: { id, companyId: session.user.companyId },
        data: { active: isActive },
    });

    revalidatePath('/[lang]/company/ai-agents', 'page');
}

export async function deleteAiAgent(id: string) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    try {
        await prisma.aiAgent.delete({
            where: { id, companyId: session.user.companyId },
        });

        revalidatePath('/[lang]/company/ai-agents', 'page');
        return 'Success: Agente IA eliminado.';
    } catch (error) {
        console.error('Failed to delete AI agent:', error);
        return 'Error: No se pudo eliminar el agente IA.';
    }
}
