import { auth } from '@/auth';
import { prisma } from '@/lib/prisma'; // force re-sync after client generation

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquareOff, Settings, Users, Tag, Inbox, Instagram, Phone } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import ChatInput from './chat-input';
import { AgentSelector } from './agent-selector';
import { Role, ChannelType } from '@prisma/client';

import { ConversationRightSidebar } from './conversation-right-sidebar';

// Server Component receiving searchParams
export default async function ConversationsPage({
    searchParams,
}: {
    searchParams: Promise<{ conversationId?: string; filter?: string; tag?: string }>
}) {
    const session = await auth();
    if (!session?.user?.companyId) return null;
    const userId = session.user.id;
    const userRole = session.user.role;
    const isAgent = userRole === Role.AGENT;

    const params = await searchParams;
    const selectedId = params?.conversationId;
    // Force 'mine' filter for agents if they try to access others, or default to 'mine'
    let filter = params?.filter || 'mine';
    const tag = params?.tag;

    if (isAgent && filter !== 'mine') {
        filter = 'mine';
    }

    // Fetch Tags for Selector
    const companyTags = await prisma.tag.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { name: 'asc' }
    });

    // --- 1. Fetch Counts for Tabs ---
    // Efficiently fetch counts using Promise.all
    const [mineCount, unassignedCount, allCount] = await Promise.all([
        prisma.conversation.count({
            where: { companyId: session.user.companyId, assignedAgents: { some: { id: userId } }, status: 'OPEN' }
        }),
        !isAgent ? prisma.conversation.count({
            where: { companyId: session.user.companyId, assignedAgents: { none: {} }, status: 'OPEN' }
        }) : Promise.resolve(0),
        !isAgent ? prisma.conversation.count({
            where: { companyId: session.user.companyId, status: 'OPEN' }
        }) : Promise.resolve(0)
    ]);

    // --- 2. Fetch Filtered Conversations ---
    const where: any = {
        companyId: session.user.companyId,
        status: 'OPEN'
    };

    if (filter === 'mine') {
        where.assignedAgents = { some: { id: userId } };
    } else if (filter === 'unassigned' && !isAgent) {
        where.assignedAgents = { none: {} };
    } else if (isAgent) {
        // Fallback safety: always filter by mine for agents
        where.assignedAgents = { some: { id: userId } };
    }

    if (tag) {
        where.tags = {
            some: {
                id: tag
            }
        };
    }

    const conversations = await prisma.conversation.findMany({
        where,
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            contact: true,
            assignedAgents: true,
            channel: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });


    // --- 3. Fetch Selected Conversation Data ---
    let selectedConversation = null;
    let messages: any[] = [];
    const companyAgents = await prisma.user.findMany({
        where: {
            companyId: session.user.companyId,
            active: true,
            role: { in: [Role.AGENT, Role.COMPANY_ADMIN] } // Show Admins too so they can assign to themselves
        },
        select: { id: true, name: true, email: true }
    });


    if (selectedId) {
        // Enforce ownership check for agents
        const conversationCheck = await prisma.conversation.findUnique({
            where: { id: selectedId },
            include: { assignedAgents: true }
        });

        if (conversationCheck) {
            const isAssigned = conversationCheck.assignedAgents.some(a => a.id === userId);
            if (!isAgent || isAssigned) {
                selectedConversation = await prisma.conversation.findUnique({
                    where: { id: selectedId },
                    include: {
                        contact: true,
                        messages: {
                            orderBy: { createdAt: 'asc' }
                        },
                        assignedAgents: true,
                        tags: true,
                        channel: true
                    }
                });
                if (selectedConversation) {
                    messages = selectedConversation.messages;
                }
            }
        }
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col md:flex-row border rounded-lg overflow-hidden bg-background">
            {/* Sidebar List */}
            <div className="w-full md:w-[320px] lg:w-[380px] border-r flex flex-col bg-white">
                {/* Header & Tabs */}
                <div className="border-b">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            Conversaciones
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-normal border-none text-[10px] h-5 px-1.5">Abiertas</Badge>
                        </h2>
                        {/* Filter/Sort icons could go here */}
                    </div>
                    {/* Tabs */}
                    <div className="flex px-4 gap-4 text-sm font-medium text-muted-foreground overflow-x-auto">
                        <Link
                            href="?filter=mine"
                            className={cn(
                                "pb-3 border-b-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5",
                                filter === 'mine' ? "border-primary text-primary" : "border-transparent hover:text-primary/80"
                            )}
                        >
                            Mías <Badge variant="secondary" className="px-1 py-0 h-4 min-w-[16px] justify-center bg-gray-100 text-gray-600 text-[10px]">{mineCount}</Badge>
                        </Link>
                        {!isAgent && (
                            <>
                                <Link
                                    href="?filter=unassigned"
                                    className={cn(
                                        "pb-3 border-b-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5",
                                        filter === 'unassigned' ? "border-primary text-primary" : "border-transparent hover:text-primary/80"
                                    )}
                                >
                                    Sin asignar <Badge variant="secondary" className="px-1 py-0 h-4 min-w-[16px] justify-center bg-gray-100 text-gray-600 text-[10px]">{unassignedCount}</Badge>
                                </Link>
                                <Link
                                    href="?filter=all"
                                    className={cn(
                                        "pb-3 border-b-2 px-1 transition-colors whitespace-nowrap flex items-center gap-1.5",
                                        filter === 'all' ? "border-primary text-primary" : "border-transparent hover:text-primary/80"
                                    )}
                                >
                                    Todos <Badge variant="secondary" className="px-1 py-0 h-4 min-w-[16px] justify-center bg-gray-100 text-gray-600 text-[10px]">{allCount}</Badge>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar..."
                            className="pl-8 h-9 bg-white"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto">
                    {conversations.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground px-4 space-y-2">
                            <p className="font-medium">
                                {filter === 'mine' ? 'No tienes conversaciones asignadas' :
                                    filter === 'unassigned' ? 'No hay conversaciones sin asignar' :
                                        'No hay conversaciones activas'}
                            </p>
                            <p className="text-xs opacity-70">
                                {filter === 'mine' ? 'Las conversaciones que se te asignen aparecerán aquí.' :
                                    filter === 'unassigned' ? '¡Todo al día! No hay clientes esperando.' :
                                        'Tus clientes aparecerán aquí cuando envíen mensajes.'}
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const lastMsg = conv.messages[0];
                            const isActive = conv.id === selectedId;
                            return (
                                <Link
                                    key={conv.id}
                                    href={`?filter=${filter}&conversationId=${conv.id}`} // Preserve filter
                                    className={cn(
                                        "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0",
                                        isActive && "bg-blue-50/60 border-l-4 border-l-primary pl-[13px]" // Active styling tweak
                                    )}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700">{conv.contact?.name?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm truncate text-gray-900">{conv.contact?.name || 'Usuario Desconocido'}</span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate mb-2">
                                            {lastMsg?.content || 'Nueva conversación'}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {conv.channel?.type === ChannelType.INSTAGRAM ? (
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-pink-200 text-pink-600 bg-pink-50 font-normal flex items-center gap-1">
                                                    <Instagram className="h-3 w-3" /> Instagram
                                                </Badge>
                                            ) : conv.channel?.type === ChannelType.WHATSAPP ? (
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-200 text-green-600 bg-green-50 font-normal flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> WhatsApp
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-gray-200 text-gray-500 font-normal">
                                                    {conv.channelId}
                                                </Badge>
                                            )}
                                            {conv.assignedAgents && conv.assignedAgents.length > 0 && (
                                                <div className="flex -space-x-2">
                                                    {conv.assignedAgents.slice(0, 3).map(agent => (
                                                        <Avatar key={agent.id} className="h-5 w-5 border-2 border-white ring-1 ring-gray-100">
                                                            <AvatarFallback className="text-[9px] font-medium bg-blue-100 text-blue-700">
                                                                {agent.name?.[0]?.toUpperCase() || 'A'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {conv.assignedAgents.length > 3 && (
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center ring-1 ring-gray-100">
                                                            <span className="text-[8px] font-medium text-gray-500">+{conv.assignedAgents.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Area (Chat or Welcome) */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b flex items-center px-6 bg-white justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{selectedConversation.contact?.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-sm text-gray-900">{selectedConversation.contact?.name}</h3>
                                    <div className="flex items-center gap-2">
                                        {selectedConversation.channel?.type === ChannelType.INSTAGRAM ? (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-pink-200 text-pink-600 bg-pink-50 flex items-center gap-1">
                                                <Instagram className="h-3 w-3" /> Instagram
                                            </Badge>
                                        ) : selectedConversation.channel?.type === ChannelType.WHATSAPP ? (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-green-200 text-green-600 bg-green-50 flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> WhatsApp
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{selectedConversation.channelId}</Badge>
                                        )}
                                        <p className="text-xs text-muted-foreground">{selectedConversation.contact?.phone}</p>
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                            {messages.map((msg) => {
                                const isOutbound = msg.direction === 'OUTBOUND';
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full",
                                            isOutbound ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                isOutbound
                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                    : "bg-white border rounded-bl-none text-gray-800"
                                            )}
                                        >
                                            <p>{msg.content}</p>
                                            <p className={cn(
                                                "text-[10px] mt-1 text-right opacity-80",
                                                isOutbound ? "text-blue-100" : "text-gray-400"
                                            )}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t">
                            <ChatInput conversationId={selectedConversation.id} />
                        </div>
                    </>
                ) : (
                    // --- WELCOME DASHBOARD (Empty State) ---
                    <div className="flex-1 overflow-auto bg-gray-50/30 p-8 md:p-12 flex flex-col items-center justify-center">
                        {isAgent ? (
                            <div className="max-w-2xl w-full space-y-8 text-center">
                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <div className="bg-white p-4 rounded-full shadow-sm">
                                            <Inbox className="h-12 w-12 text-blue-500" />
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-semibold text-gray-900">
                                        👋 ¡Hola, {session.user.name || 'Agente'}!
                                    </h1>
                                    <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
                                        Bienvenido al panel. Selecciona una conversación de la izquierda para comenzar a responder a tus clientes.
                                        Las conversaciones asignadas a ti aparecerán aquí automáticamente.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl w-full space-y-8">
                                <div className="space-y-4">
                                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                        👋 Buenas tardes, {session.user.name || 'Usuario'}. Bienvenido a Varylo.
                                    </h1>
                                    <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                                        Gracias por registrarse. Queremos que saque el máximo provecho de Varylo.
                                        Aquí hay algunas cosas que puede hacer para hacer que la experiencia sea agradable.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Card 1: Inbox */}
                                    <Card className="p-6 hover:shadow-md transition-all border shadow-sm group">
                                        <div className="flex flex-col gap-4 h-full justify-between">
                                            <div className="flex justify-center py-4">
                                                {/* Placeholder for the 'apps' icon in mockup */}
                                                <div className="relative">
                                                    <Inbox className="h-12 w-12 text-blue-500" />
                                                    <Badge className="absolute -top-2 -right-2 bg-red-500 h-5 w-5 rounded-full p-0 flex items-center justify-center border-2 border-white">3</Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="font-semibold text-gray-900">Todas sus conversaciones en un solo lugar</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Ver todas las conversaciones de sus clientes en un solo panel de control. Filtre por canal, etiqueta o estado.
                                                </p>
                                            </div>
                                            <Link href="?filter=all" className="text-blue-600 text-xs font-medium hover:underline text-center flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                                                Haga clic aquí para ir a la bandeja de entrada <Search className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </Card>

                                    {/* Card 2: Team */}
                                    <Card className="p-6 hover:shadow-md transition-all border shadow-sm group">
                                        <div className="flex flex-col gap-4 h-full justify-between">
                                            <div className="flex justify-center py-4">
                                                <div className="flex -space-x-3">
                                                    <Avatar className="border-2 border-white ring-2 ring-gray-100"><AvatarFallback className="bg-blue-100 text-blue-600">A</AvatarFallback></Avatar>
                                                    <Avatar className="border-2 border-white ring-2 ring-gray-100"><AvatarFallback className="bg-green-100 text-green-600">B</AvatarFallback></Avatar>
                                                    <Avatar className="border-2 border-white ring-2 ring-gray-100"><AvatarFallback className="bg-purple-100 text-purple-600">C</AvatarFallback></Avatar>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="font-semibold text-gray-900">Invite a los miembros de su equipo</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Ya que se está preparando para hablar con su cliente, invite a sus compañeros.
                                                </p>
                                            </div>
                                            <Link href="/company/agents" className="text-blue-600 text-xs font-medium hover:underline text-center flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                                                Haga clic aquí para invitar a un miembro <Users className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </Card>

                                    {/* Card 3: Canned Responses (Stub) */}
                                    <Card className="p-6 hover:shadow-md transition-all border shadow-sm group">
                                        <div className="flex flex-col gap-4 h-full justify-between">
                                            <div className="flex justify-center py-4">
                                                <div className="bg-gray-100 p-3 rounded-lg">
                                                    <code className="text-xs text-gray-500">/saludo Hola, ¿cómo estás?</code>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="font-semibold text-gray-900">Crea respuestas predefinidas</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Las respuestas predefinidas son plantillas que le ayudan a responder rápidamente.
                                                </p>
                                            </div>
                                            <Link href="/company/settings" className="text-blue-600 text-xs font-medium hover:underline text-center flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                                                Haga clic aquí para crear una respuesta <Settings className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </Card>

                                    {/* Card 4: Tags (Stub) */}
                                    <Card className="p-6 hover:shadow-md transition-all border shadow-sm group">
                                        <div className="flex flex-col gap-4 h-full justify-between">
                                            <div className="flex justify-center py-4 gap-2">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">#ventas</Badge>
                                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">#soporte</Badge>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="font-semibold text-gray-900">Organice las conversaciones con etiquetas</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Las etiquetas proporcionan una forma fácil de clasificar su conversación.
                                                </p>
                                            </div>
                                            <Link href="/company/settings/tags" className="text-blue-600 text-xs font-medium hover:underline text-center flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                                                Haga clic aquí para crear etiquetas <Tag className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Context Sidebar */}
            {
                selectedConversation && (
                    <ConversationRightSidebar
                        conversation={selectedConversation}
                        companyTags={companyTags}
                        companyAgents={companyAgents}
                        className="hidden xl:flex w-[350px] shrink-0 border-l"
                        isAgent={isAgent}
                    />
                )
            }
        </div >
    );
}
