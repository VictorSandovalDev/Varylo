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

export async function testWhatsAppConnection() {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        const channel = await prisma.channel.findFirst({
            where: {
                companyId: session.user.companyId,
                type: ChannelType.WHATSAPP,
            },
        });

        if (!channel || !channel.configJson) {
            return { success: false, message: 'No WhatsApp configuration found.' };
        }

        const config = channel.configJson as { phoneNumberId?: string; accessToken?: string };
        const { phoneNumberId, accessToken } = config;

        if (!phoneNumberId || !accessToken) {
            return { success: false, message: 'Incomplete configuration.' };
        }

        // Make a lightweight request to Meta API to verify token validity
        // Fetching the phone number details is a good test
        // Request specific fields to show the user
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return { success: false, message: `Meta API Error: ${data.error?.message || 'Unknown error'}` };
        }

        const data = await response.json();
        const displayInfo = data.verified_name || data.display_phone_number || 'WhatsApp Account';

        return { success: true, message: `Connectado: ${displayInfo} (${data.quality_rating})` };

    } catch (error) {
        console.error('Test connection failed:', error);
        return { success: false, message: 'Internal server error during test.' };
    }
}

export async function disconnectWhatsApp() {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        const channel = await prisma.channel.findFirst({
            where: {
                companyId: session.user.companyId,
                type: ChannelType.WHATSAPP,
            },
        });

        if (channel) {
            await prisma.channel.update({
                where: { id: channel.id },
                data: {
                    status: ChannelStatus.DISCONNECTED,
                    configJson: {}, // Clear credentials
                },
            });
        }

        revalidatePath('/[lang]/company/settings', 'page');
        return { success: true, message: 'WhatsApp disconnected successfully.' };
    } catch (error) {
        console.error('Disconnect failed:', error);
        return { success: false, message: 'Failed to disconnect.' };
    }
}
