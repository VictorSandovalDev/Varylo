'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import type { ChatbotFlow } from '@/types/chatbot';

const DEFAULT_FLOW: ChatbotFlow = {
    startNodeId: 'welcome',
    nodes: {
        welcome: {
            id: 'welcome',
            message: '¡Hola! ¿En qué puedo ayudarte?',
            options: [
                { label: 'Información general', match: ['1', 'información', 'info'], nextNodeId: 'info' },
                { label: 'Hablar con un agente', match: ['2', 'agente', 'humano'], nextNodeId: 'transfer' },
            ],
        },
        info: {
            id: 'info',
            message: 'Aquí tienes información general. ¿Necesitas algo más?',
            options: [
                { label: 'Volver al inicio', match: ['1', 'inicio', 'volver'], nextNodeId: 'welcome' },
                { label: 'Hablar con un agente', match: ['2', 'agente', 'humano'], nextNodeId: 'transfer' },
            ],
        },
        transfer: {
            id: 'transfer',
            message: 'Te conecto con un agente humano. Un momento por favor.',
            action: { type: 'transfer_to_human' },
        },
    },
};

export async function createChatbot(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const name = formData.get('name') as string;
    const channelIds = formData.getAll('channelIds') as string[];

    if (!name) {
        return 'Error: El nombre es requerido.';
    }

    try {
        await prisma.chatbot.create({
            data: {
                companyId: session.user.companyId,
                name,
                flowJson: DEFAULT_FLOW as unknown as Prisma.InputJsonValue,
                channels: channelIds.length > 0 ? {
                    connect: channelIds.map(id => ({ id })),
                } : undefined,
            },
        });

        revalidatePath('/[lang]/company/chatbots', 'page');
        return 'Success: Chatbot creado correctamente.';
    } catch (error) {
        console.error('Failed to create chatbot:', error);
        return 'Error: No se pudo crear el chatbot.';
    }
}

export async function updateChatbot(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const channelIds = formData.getAll('channelIds') as string[];

    if (!id || !name) return 'Error: Campos requeridos faltantes.';

    try {
        await prisma.chatbot.update({
            where: { id, companyId: session.user.companyId },
            data: {
                name,
                channels: {
                    set: channelIds.map(cid => ({ id: cid })),
                },
            },
        });

        revalidatePath('/[lang]/company/chatbots', 'page');
        return 'Success: Chatbot actualizado.';
    } catch (error) {
        console.error('Failed to update chatbot:', error);
        return 'Error: No se pudo actualizar.';
    }
}

export async function toggleChatbot(id: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.companyId) throw new Error('Unauthorized');

    await prisma.chatbot.update({
        where: { id, companyId: session.user.companyId },
        data: { active: isActive },
    });

    revalidatePath('/[lang]/company/chatbots', 'page');
}

export async function deleteChatbot(id: string) {
    const session = await auth();
    if (!session?.user?.companyId) return 'Error: No authorized session found.';

    try {
        await prisma.chatbot.delete({
            where: { id, companyId: session.user.companyId },
        });

        revalidatePath('/[lang]/company/chatbots', 'page');
        return 'Success: Chatbot eliminado.';
    } catch (error) {
        console.error('Failed to delete chatbot:', error);
        return 'Error: No se pudo eliminar.';
    }
}
