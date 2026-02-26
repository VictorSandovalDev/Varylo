import { prisma } from '@/lib/prisma';
import { getOpenAIForCompany } from '@/lib/openai';
import { checkCreditBalance, deductCredits, logUsageOnly } from '@/lib/credits';

export async function analyzeConversation(conversationId: string) {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                },
                contact: true,
            },
        });

        if (!conversation || conversation.messages.length === 0) {
            return null;
        }

        const transcript = conversation.messages
            .map((msg) => {
                const role = msg.direction === 'INBOUND' ? 'Cliente' : 'Agente';
                return `[${role}]: ${msg.content}`;
            })
            .join('\n');

        const contactName = conversation.contact?.name || 'Desconocido';

        const { client: openai, usesOwnKey } = await getOpenAIForCompany(conversation.companyId);

        // Credit check: if not using own key, must have credits
        if (!usesOwnKey) {
            const { hasCredits } = await checkCreditBalance(conversation.companyId);
            if (!hasCredits) {
                console.log(`[AI] Company ${conversation.companyId} has no credits, skipping analysis`);
                return null;
            }
        }

        const analysisModel = 'gpt-4o-mini';
        const response = await openai.chat.completions.create({
            model: analysisModel,
            temperature: 0.3,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `Eres un analista de conversaciones de atención al cliente. Analiza la siguiente conversación y devuelve un JSON con exactamente estos campos:

- "toneScore": número del 1 al 100 que indica qué tan profesional y empático es el tono general de la conversación (100 = excelente)
- "clarityScore": número del 1 al 100 que indica qué tan clara y efectiva fue la comunicación (100 = perfectamente clara)
- "summary": resumen breve (1-2 oraciones) en español de la conversación
- "sentiment": uno de "positive", "neutral", "negative" — el sentimiento general del cliente
- "topics": array de strings con los temas principales discutidos (máximo 5)
- "urgency": uno de "low", "medium", "high" — nivel de urgencia de la conversación

Responde SOLO con el JSON, sin texto adicional.`,
                },
                {
                    role: 'user',
                    content: `Cliente: ${contactName}\n\nConversación:\n${transcript}`,
                },
            ],
        });

        // Track usage
        const usage = response.usage;
        if (usage) {
            if (usesOwnKey) {
                await logUsageOnly({
                    companyId: conversation.companyId,
                    conversationId,
                    model: analysisModel,
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens,
                });
            } else {
                await deductCredits({
                    companyId: conversation.companyId,
                    conversationId,
                    model: analysisModel,
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens,
                });
            }
        }

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const analysis = JSON.parse(content) as {
            toneScore: number;
            clarityScore: number;
            summary: string;
            sentiment: string;
            topics: string[];
            urgency: string;
        };

        // Upsert: find existing insight for this conversation, update or create
        const existing = await prisma.conversationInsight.findFirst({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
        });

        const data = {
            companyId: conversation.companyId,
            conversationId,
            toneScore: Math.max(1, Math.min(100, Math.round(analysis.toneScore))),
            clarityScore: Math.max(1, Math.min(100, Math.round(analysis.clarityScore))),
            summary: analysis.summary,
            flagsJson: {
                sentiment: analysis.sentiment,
                topics: analysis.topics,
                urgency: analysis.urgency,
            },
        };

        if (existing) {
            await prisma.conversationInsight.update({
                where: { id: existing.id },
                data,
            });
        } else {
            await prisma.conversationInsight.create({ data });
        }

        return data;
    } catch (error) {
        console.error(`[AI] Error analyzing conversation ${conversationId}:`, error);
        return null;
    }
}
