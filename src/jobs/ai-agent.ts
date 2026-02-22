import { prisma } from '@/lib/prisma';
import { getOpenAIForCompany } from '@/lib/openai';
import { sendChannelMessage } from '@/lib/channel-sender';
import { Role } from '@prisma/client';

interface AiAgentResult {
    handled: boolean;
    transferredToHuman?: boolean;
}

export async function handleAiAgentResponse(conversationId: string, inboundMessage: string): Promise<AiAgentResult> {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                handledByAiAgent: {
                    include: { channels: true },
                },
                channel: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                },
            },
        });

        if (!conversation) {
            return { handled: false };
        }

        // If the conversation is not handled by an AI agent, check if there's one for this channel
        let aiAgent = conversation.handledByAiAgent;

        if (!aiAgent) {
            // Find an active AI agent assigned to this channel
            aiAgent = await prisma.aiAgent.findFirst({
                where: {
                    companyId: conversation.companyId,
                    active: true,
                    channels: {
                        some: { id: conversation.channelId },
                    },
                },
                include: { channels: true },
            });

            if (!aiAgent) {
                return { handled: false };
            }

            // Assign the AI agent to the conversation
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { handledByAiAgentId: aiAgent.id },
            });
        }

        if (!aiAgent.active) {
            return { handled: false };
        }

        // Check for transfer keywords
        const lowerMessage = inboundMessage.toLowerCase().trim();
        const shouldTransfer = aiAgent.transferKeywords.some(keyword =>
            lowerMessage.includes(keyword.toLowerCase())
        );

        if (shouldTransfer) {
            await transferToHuman(conversationId, conversation.companyId);
            await sendChannelMessage({
                conversationId,
                companyId: conversation.companyId,
                content: 'Te estoy transfiriendo con un agente humano. Un momento por favor.',
                fromName: aiAgent.name,
            });
            return { handled: true, transferredToHuman: true };
        }

        // Build chat history
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            {
                role: 'system',
                content: buildSystemPrompt(aiAgent.systemPrompt, aiAgent.contextInfo),
            },
        ];

        for (const msg of conversation.messages) {
            messages.push({
                role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
                content: msg.content,
            });
        }

        // Add the current message (it's already in DB but make sure it's in the history)
        // The last message in the DB should be the inbound one we just received

        const openai = await getOpenAIForCompany(conversation.companyId);
        const response = await openai.chat.completions.create({
            model: aiAgent.model,
            temperature: aiAgent.temperature,
            messages,
        });

        let replyContent = response.choices[0]?.message?.content;
        if (!replyContent) {
            return { handled: false };
        }

        // Check if AI wants to transfer
        if (replyContent.includes('[TRANSFER_TO_HUMAN]')) {
            replyContent = replyContent.replace('[TRANSFER_TO_HUMAN]', '').trim();
            if (replyContent) {
                await sendChannelMessage({
                    conversationId,
                    companyId: conversation.companyId,
                    content: replyContent,
                    fromName: aiAgent.name,
                });
            }
            await transferToHuman(conversationId, conversation.companyId);
            return { handled: true, transferredToHuman: true };
        }

        // Send the AI response
        await sendChannelMessage({
            conversationId,
            companyId: conversation.companyId,
            content: replyContent,
            fromName: aiAgent.name,
        });

        return { handled: true };
    } catch (error) {
        console.error(`[AI Agent] Error handling conversation ${conversationId}:`, error);
        return { handled: false };
    }
}

function buildSystemPrompt(systemPrompt: string, contextInfo: string | null): string {
    let prompt = systemPrompt;
    if (contextInfo) {
        prompt += `\n\nInformación de contexto adicional:\n${contextInfo}`;
    }
    prompt += '\n\nSi el usuario insiste en hablar con un humano o si no puedes resolver su consulta, responde con [TRANSFER_TO_HUMAN] al inicio de tu mensaje seguido de un mensaje de despedida amable.';
    return prompt;
}

async function transferToHuman(conversationId: string, companyId: string) {
    // Find a random active human agent
    const agents = await prisma.user.findMany({
        where: {
            companyId,
            active: true,
            role: Role.AGENT,
        },
        select: { id: true },
    });

    const updateData: Record<string, unknown> = {
        handledByAiAgentId: null,
    };

    if (agents.length > 0) {
        const randomIndex = Math.floor(Math.random() * agents.length);
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                ...updateData,
                assignedAgents: {
                    connect: { id: agents[randomIndex].id },
                },
            },
        });
    } else {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: updateData,
        });
    }
}
