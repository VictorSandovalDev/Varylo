import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChannelType, MessageDirection, Role } from '@prisma/client';
import { runAutomationPipeline } from '@/jobs/pipeline';

export const dynamic = 'force-dynamic';

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-webchat-key',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** Find the WEB_CHAT channel by API key */
async function findChannelByKey(apiKey: string) {
    const channels = await prisma.channel.findMany({
        where: { type: ChannelType.WEB_CHAT, status: 'CONNECTED' },
    });
    return channels.find((c) => {
        const config = c.configJson as { apiKey?: string } | null;
        return config?.apiKey === apiKey;
    });
}

/**
 * POST /api/webchat  — two actions: "start_session" and "send_message"
 * GET  /api/webchat?sessionId=xxx&after=timestamp  — poll for messages
 */
export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get('x-webchat-key');
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing x-webchat-key header' }, { status: 401, headers: CORS_HEADERS });
        }

        const channel = await findChannelByKey(apiKey);
        if (!channel) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS });
        }

        const body = await req.json();
        const { action } = body;

        if (action === 'start_session') {
            return handleStartSession(channel, body);
        } else if (action === 'send_message') {
            return handleSendMessage(channel, body);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: CORS_HEADERS });
    } catch (error) {
        console.error('[WebChat] Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS_HEADERS });
    }
}

export async function GET(req: NextRequest) {
    try {
        const apiKey = req.headers.get('x-webchat-key');
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing x-webchat-key header' }, { status: 401, headers: CORS_HEADERS });
        }

        const channel = await findChannelByKey(apiKey);
        if (!channel) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS });
        }

        const sessionId = req.nextUrl.searchParams.get('sessionId');
        const after = req.nextUrl.searchParams.get('after');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400, headers: CORS_HEADERS });
        }

        // Verify conversation belongs to this channel's company
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: sessionId,
                companyId: channel.companyId,
                channelId: channel.id,
            },
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: CORS_HEADERS });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: sessionId,
                ...(after ? { createdAt: { gt: new Date(after) } } : {}),
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                direction: true,
                content: true,
                from: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ messages }, { headers: CORS_HEADERS });
    } catch (error) {
        console.error('[WebChat] Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500, headers: CORS_HEADERS });
    }
}

async function handleStartSession(
    channel: { id: string; companyId: string; automationPriority: any },
    body: { visitorName?: string; visitorEmail?: string }
) {
    const companyId = channel.companyId;
    const visitorId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const name = body.visitorName || 'Visitante Web';

    // Create contact
    const contact = await prisma.contact.create({
        data: {
            companyId,
            phone: visitorId, // unique identifier for web visitors
            name,
            email: body.visitorEmail || undefined,
        },
    });

    // Check for active AI agent on this channel
    const activeAiAgent = await prisma.aiAgent.findFirst({
        where: {
            companyId,
            active: true,
            channels: { some: { id: channel.id } },
        },
    });

    let conversation;

    if (activeAiAgent) {
        conversation = await prisma.conversation.create({
            data: {
                companyId,
                channelId: channel.id,
                contactId: contact.id,
                status: 'OPEN',
                handledByAiAgentId: activeAiAgent.id,
            },
        });
    } else {
        // Assign to random human agent
        const agents = await prisma.user.findMany({
            where: { companyId, active: true, role: Role.AGENT },
            select: { id: true },
        });

        const selectedAgentId = agents.length > 0
            ? agents[Math.floor(Math.random() * agents.length)].id
            : null;

        conversation = await prisma.conversation.create({
            data: {
                companyId,
                channelId: channel.id,
                contactId: contact.id,
                status: 'OPEN',
                assignedAgents: selectedAgentId ? { connect: { id: selectedAgentId } } : undefined,
            },
        });
    }

    return NextResponse.json(
        { sessionId: conversation.id, contactId: contact.id },
        { headers: CORS_HEADERS }
    );
}

async function handleSendMessage(
    channel: { id: string; companyId: string; automationPriority: any },
    body: { sessionId?: string; content?: string }
) {
    const { sessionId, content } = body;

    if (!sessionId || !content?.trim()) {
        return NextResponse.json(
            { error: 'Missing sessionId or content' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    // Verify conversation exists and belongs to this channel
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: sessionId,
            companyId: channel.companyId,
            channelId: channel.id,
        },
        include: { contact: true },
    });

    if (!conversation) {
        return NextResponse.json(
            { error: 'Session not found' },
            { status: 404, headers: CORS_HEADERS }
        );
    }

    // Save inbound message
    const message = await prisma.message.create({
        data: {
            companyId: channel.companyId,
            conversationId: sessionId,
            direction: MessageDirection.INBOUND,
            from: conversation.contact.name || 'Visitante Web',
            to: 'webchat',
            content: content.trim(),
        },
    });

    // Update conversation timestamps
    await prisma.conversation.update({
        where: { id: sessionId },
        data: { lastMessageAt: new Date(), lastInboundAt: new Date() },
    });

    // Run automation pipeline and wait for response
    await runAutomationPipeline(sessionId, content.trim(), channel.automationPriority);

    // Fetch any new messages generated by the pipeline (AI/chatbot responses)
    const newMessages = await prisma.message.findMany({
        where: {
            conversationId: sessionId,
            createdAt: { gt: message.createdAt },
        },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            direction: true,
            content: true,
            from: true,
            createdAt: true,
        },
    });

    return NextResponse.json(
        { messageId: message.id, responses: newMessages },
        { headers: CORS_HEADERS }
    );
}
