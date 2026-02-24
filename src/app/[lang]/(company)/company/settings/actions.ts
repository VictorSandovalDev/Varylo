'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChannelType, ChannelStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { encrypt } from '@/lib/encryption';
import OpenAI from 'openai';

export async function exchangeWhatsAppCode(
    code: string,
    sessionInfo?: { phone_number_id?: string; waba_id?: string }
) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return { success: false, message: 'No authorized session found.' };
    }

    const companyId = session.user.companyId;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
        return { success: false, message: 'Server configuration missing (META_APP_ID / META_APP_SECRET).' };
    }

    try {
        // 1. Exchange code for access token
        const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('Token exchange failed:', tokenData);
            return { success: false, message: `Token exchange failed: ${tokenData.error?.message || 'Unknown error'}` };
        }

        const accessToken = tokenData.access_token as string;

        // 2. Use session info from Embedded Signup if available
        let phoneNumberId = sessionInfo?.phone_number_id;
        let wabaId = sessionInfo?.waba_id;

        // 3. If missing wabaId, try debug_token to find it from granular scopes
        if (!wabaId) {
            const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;
            const debugRes = await fetch(debugUrl);
            const debugData = await debugRes.json();

            if (debugData.data?.granular_scopes) {
                const waScope = debugData.data.granular_scopes.find(
                    (s: any) => s.scope === 'whatsapp_business_management'
                );
                if (waScope?.target_ids?.length > 0) {
                    wabaId = waScope.target_ids[0];
                }
            }
        }

        // 4. If we have wabaId but no phoneNumberId, fetch phone numbers
        if (wabaId && !phoneNumberId) {
            const phonesRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/phone_numbers`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const phonesData = await phonesRes.json();
            if (phonesData.data?.length > 0) {
                phoneNumberId = phonesData.data[0].id;
            }
        }

        if (!phoneNumberId || !wabaId) {
            return { success: false, message: 'Could not determine Phone Number ID or WABA ID from the signup flow.' };
        }

        // 5. Subscribe the WABA to webhooks
        const subscribeRes = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!subscribeRes.ok) {
            const subData = await subscribeRes.json();
            console.error('WABA subscription failed:', subData);
            // Non-fatal: continue anyway
        }

        // 6. Register the phone number
        const registerRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/register`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                pin: '000000',
            }),
        });
        if (!registerRes.ok) {
            const regData = await registerRes.json();
            // 4600xx errors mean already registered — that's fine
            if (!regData.error?.code?.toString().startsWith('460')) {
                console.error('Phone registration failed:', regData);
            }
        }

        // 7. Save to DB
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'varylo_verify_token';
        const configJson = {
            phoneNumberId,
            accessToken,
            wabaId,
            verifyToken,
        };

        const existingChannel = await prisma.channel.findFirst({
            where: { companyId, type: ChannelType.WHATSAPP },
        });

        if (existingChannel) {
            await prisma.channel.update({
                where: { id: existingChannel.id },
                data: { configJson, status: ChannelStatus.CONNECTED },
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
        return { success: true, message: 'WhatsApp connected successfully.' };
    } catch (error) {
        console.error('Failed to exchange WhatsApp code:', error);
        return { success: false, message: 'Failed to connect WhatsApp.' };
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
