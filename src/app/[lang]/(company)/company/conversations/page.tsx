import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, MessageSquareOff } from "lucide-react";
import { redirect } from 'next/navigation';

export default async function ConversationsPage() {
    const session = await auth();
    if (!session?.user?.companyId) return null;

    const conversations = await prisma.conversation.findMany({
        where: {
            companyId: session.user.companyId
        },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            contact: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    if (conversations.length === 0) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center border rounded-lg bg-muted/10">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <MessageSquareOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">No hay conversaciones activas</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Cuando tus clientes envíen mensajes a través de WhatsApp u otros canales, aparecerán aquí.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col md:flex-row border rounded-lg overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-[320px] border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar..."
                            className="pl-8 bg-background"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {conversations.map((conv) => {
                        const lastMsg = conv.messages[0];
                        return (
                            <div key={conv.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b">
                                <Avatar>
                                    <AvatarFallback>{conv.contact?.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{conv.contact?.name || 'Usuario Desconocido'}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {lastMsg?.content || 'Nueva conversación'}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="outline" className="text-xs">{conv.channelId}</Badge>
                                        <Badge className={`text-xs ${conv.status === 'OPEN' ? 'bg-green-500' : 'bg-secondary'}`}>
                                            {conv.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area - Placeholder for now as selection logic is complex state */}
            <div className="flex-1 flex flex-col bg-background items-center justify-center text-muted-foreground">
                <p>Selecciona una conversación para ver los detalles.</p>
            </div>
        </div>
    );
}
