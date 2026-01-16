'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChannelType, ChannelStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function saveWhatsAppCredentials(prevState: string | undefined, formData: FormData) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const companyId = session.user.companyId;
    const phoneNumberId = formData.get('phoneNumberId') as string;
    const accessToken = formData.get('accessToken') as string;
    const verifyToken = formData.get('verifyToken') as string;

    if (!phoneNumberId || !accessToken || !verifyToken) {
        return 'Error: All fields are required.';
    }

    try {
        // Upsert the channel: look for existing WHATSAPP channel for this company
        // Since schema doesn't have unique constraint on [companyId, type], we findFirst then update or create.
        // Or we can assume one channel per type per company for now.

        const existingChannel = await prisma.channel.findFirst({
            where: {
                companyId,
                type: ChannelType.WHATSAPP,
            },
        });

        const configJson = {
            phoneNumberId,
            accessToken,
            verifyToken,
        };

        if (existingChannel) {
            await prisma.channel.update({
                where: { id: existingChannel.id },
                data: {
                    configJson,
                    status: ChannelStatus.CONNECTED, // Assume connected if creds provided
                },
            });
        } else {
            await prisma.channel.create({
                data: {
                    companyId,
                    type: ChannelType.WHATSAPP,
                    status: ChannelStatus.CONNECTED,
                    configJson,
                },
            });
        }

        revalidatePath('/[lang]/company/settings', 'page');
        return 'Success: Credentials saved successfully.';
    } catch (error) {
        console.error('Failed to save WhatsApp credentials:', error);
        return 'Error: Failed to save credentials.';
    }
}
