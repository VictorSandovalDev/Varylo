'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChannelType, ChannelStatus, AutomationPriority } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption';
import OpenAI from 'openai';

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

// INSTAGRAM ACTIONS

export async function saveInstagramCredentials(prevState: string | undefined, formData: FormData) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const companyId = session.user.companyId;
    const pageId = formData.get('pageId') as string;
    const accessToken = formData.get('accessToken') as string;
    // verifyToken coming from form might be empty in OAuth flow, as we use global token.

    if (!pageId || !accessToken) {
        return 'Error: Page ID and Access Token are required.';
    }

    const GLOBAL_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'varylo_default_verify_token';

    try {
        const existingChannel = await prisma.channel.findFirst({
            where: {
                companyId,
                type: ChannelType.INSTAGRAM,
            },
        });

        const configJson = {
            pageId,
            accessToken,
            verifyToken: GLOBAL_VERIFY_TOKEN, // Store the global one or just rely on env
        };

        if (existingChannel) {
            await prisma.channel.update({
                where: { id: existingChannel.id },
                data: {
                    configJson,
                    status: ChannelStatus.CONNECTED,
                },
            });
        } else {
            await prisma.channel.create({
                data: {
                    companyId,
                    type: ChannelType.INSTAGRAM,
                    status: ChannelStatus.CONNECTED,
                    configJson,
                },
            });
        }

        revalidatePath('/[lang]/company/settings', 'page');
        return 'Success: Instagram connected successfully.';
    } catch (error) {
        console.error('Failed to save Instagram credentials:', error);
        return 'Error: Failed to save credentials.';
    }
}

export async function testInstagramConnection() {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        const channel = await prisma.channel.findFirst({
            where: {
                companyId: session.user.companyId,
                type: ChannelType.INSTAGRAM,
            },
        });

        if (!channel || !channel.configJson) {
            return { success: false, message: 'No Instagram configuration found.' };
        }

        const config = channel.configJson as { pageId?: string; accessToken?: string };
        const { pageId, accessToken } = config;

        if (!pageId || !accessToken) {
            return { success: false, message: 'Incomplete configuration.' };
        }

        const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=name,username`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            return { success: false, message: `Meta API Error: ${data.error?.message || 'Unknown error'}` };
        }

        const data = await response.json();
        const displayInfo = data.name || data.username || 'Instagram Account';

        return { success: true, message: `Connected: ${displayInfo}` };

    } catch (error) {
        console.error('Test connection failed:', error);
        return { success: false, message: 'Internal server error during test.' };
    }
}

export async function disconnectInstagram() {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        const channel = await prisma.channel.findFirst({
            where: {
                companyId: session.user.companyId,
                type: ChannelType.INSTAGRAM,
            },
        });

        if (channel) {
            await prisma.channel.update({
                where: { id: channel.id },
                data: {
                    status: ChannelStatus.DISCONNECTED,
                    configJson: {},
                },
            });
        }

        revalidatePath('/[lang]/company/settings', 'page');
        return { success: true, message: 'Instagram disconnected successfully.' };
    } catch (error) {
        console.error('Disconnect failed:', error);
        return { success: false, message: 'Failed to disconnect.' };
    }
}

// OPENAI API KEY ACTIONS

export async function saveOpenAIKey(prevState: string | undefined, formData: FormData) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return 'Error: No authorized session found.';
    }

    const apiKey = formData.get('openaiApiKey') as string;

    if (!apiKey || !apiKey.startsWith('sk-')) {
        return 'Error: La API Key debe comenzar con "sk-".';
    }

    try {
        // Validate the key by calling models.list()
        const testClient = new OpenAI({ apiKey });
        await testClient.models.list();
    } catch {
        return 'Error: La API Key no es válida. Verifica que sea correcta.';
    }

    try {
        const encryptedKey = encrypt(apiKey);

        await prisma.company.update({
            where: { id: session.user.companyId },
            data: {
                openaiApiKey: encryptedKey,
                openaiApiKeyUpdatedAt: new Date(),
            },
        });

        revalidatePath('/[lang]/company/settings', 'page');
        return 'Success: API Key guardada correctamente.';
    } catch (error) {
        console.error('Failed to save OpenAI key:', error);
        return 'Error: No se pudo guardar la API Key.';
    }
}

export async function removeOpenAIKey() {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        await prisma.company.update({
            where: { id: session.user.companyId },
            data: {
                openaiApiKey: null,
                openaiApiKeyUpdatedAt: null,
            },
        });

        revalidatePath('/[lang]/company/settings', 'page');
        return { success: true, message: 'API Key eliminada.' };
    } catch (error) {
        console.error('Failed to remove OpenAI key:', error);
        return { success: false, message: 'Failed to remove key.' };
    }
}

// AUTOMATION PRIORITY

export async function updateChannelPriority(channelId: string, priority: AutomationPriority) {
    const session = await auth();
    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session.' };
    }

    try {
        // Verify the channel belongs to this company
        const channel = await prisma.channel.findFirst({
            where: { id: channelId, companyId: session.user.companyId },
        });

        if (!channel) {
            return { success: false, message: 'Channel not found.' };
        }

        await prisma.channel.update({
            where: { id: channelId },
            data: { automationPriority: priority },
        });

        revalidatePath('/[lang]/company/settings', 'page');
        return { success: true, message: 'Prioridad actualizada.' };
    } catch (error) {
        console.error('Failed to update channel priority:', error);
        return { success: false, message: 'Failed to update priority.' };
    }
}
