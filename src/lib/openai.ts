import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };

export function getOpenAI(): OpenAI {
    if (!globalForOpenAI.openai) {
        globalForOpenAI.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return globalForOpenAI.openai;
}

export async function getOpenAIForCompany(companyId: string): Promise<OpenAI> {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { openaiApiKey: true },
    });

    if (company?.openaiApiKey) {
        try {
            const decryptedKey = decrypt(company.openaiApiKey);
            return new OpenAI({ apiKey: decryptedKey });
        } catch (error) {
            console.error(`[OpenAI] Failed to decrypt API key for company ${companyId}, falling back to global key`);
        }
    }

    return getOpenAI();
}
