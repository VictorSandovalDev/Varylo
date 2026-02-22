import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FlowEditor } from './flow-editor';
import type { ChatbotFlow } from '@/types/chatbot';

export default async function ChatbotFlowPage({ params }: { params: Promise<{ chatbotId: string; lang: string }> }) {
    const { chatbotId, lang } = await params;
    const session = await auth();
    if (!session?.user?.companyId) return null;

    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId, companyId: session.user.companyId },
    });

    if (!chatbot) {
        notFound();
    }

    const flow = chatbot.flowJson as unknown as ChatbotFlow;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Editor de Flujo: {chatbot.name}</h3>
                <p className="text-sm text-muted-foreground">
                    Define los mensajes, opciones y acciones del chatbot.
                </p>
            </div>
            <FlowEditor chatbotId={chatbot.id} initialFlow={flow} backHref={`/${lang}/company/chatbots`} />
        </div>
    );
}
