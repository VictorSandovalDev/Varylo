'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Instagram, Phone, Globe } from 'lucide-react';
import { UnreadDot } from './unread-dot';
import { ConversationListActions } from './conversation-list-actions';
import { BulkToolbar, ConversationCheckbox, BulkDeleteDialog } from './bulk-actions';
import { deleteConversations } from './actions';
import { toast } from 'sonner';

interface ConversationItem {
    id: string;
    contact: { name: string | null; phone: string } | null;
    channel: { type: string } | null;
    messages: { content: string; createdAt: string | Date }[];
    assignedAgents: { id: string; name: string | null }[];
}

interface ConversationListProps {
    conversations: ConversationItem[];
    selectedId?: string;
    filter: string;
    isAgent: boolean;
    channelFilter: string;
}

const CHANNEL_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'WEB_CHAT', label: 'Web Chat' },
];

export function ConversationList({ conversations, selectedId, filter, isAgent, channelFilter }: ConversationListProps) {
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    // Filtering is done server-side via Prisma query
    const filtered = conversations;

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(c => c.id)));
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteConversations(Array.from(selected));
        setIsDeleting(false);
        if (result.success) {
            toast.success(`${result.count} conversaciones eliminadas`);
            setSelected(new Set());
            setSelectMode(false);
            setShowDeleteDialog(false);
            router.refresh();
        } else {
            toast.error(result.message || 'Error al eliminar');
        }
    };

    return (
        <>
            {/* Channel filter + Bulk actions */}
            <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
                <div className="flex gap-1 overflow-x-auto">
                    {CHANNEL_OPTIONS.map(opt => (
                        <Link
                            key={opt.value}
                            href={opt.value ? `?filter=${filter}&channel=${opt.value}` : `?filter=${filter}`}
                            className={cn(
                                "text-[11px] px-2 py-1 rounded-full whitespace-nowrap transition-colors",
                                channelFilter === opt.value
                                    ? "bg-primary text-primary-foreground"
                                    : !channelFilter && !opt.value
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {opt.label}
                        </Link>
                    ))}
                </div>
                {!isAgent && (
                    <BulkToolbar
                        selectMode={selectMode}
                        selectedCount={selected.size}
                        totalCount={filtered.length}
                        onToggleAll={toggleAll}
                        onDelete={() => setShowDeleteDialog(true)}
                        onExit={() => { setSelectMode(false); setSelected(new Set()); }}
                        onEnter={() => setSelectMode(true)}
                    />
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {filtered.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground px-4 space-y-2">
                        <p className="font-medium">No hay conversaciones</p>
                        <p className="text-xs opacity-70">
                            {channelFilter ? 'No hay conversaciones en este canal.' : 'Las conversaciones aparecerán aquí.'}
                        </p>
                    </div>
                ) : (
                    filtered.map((conv) => {
                        const lastMsg = conv.messages[0];
                        const isActive = conv.id === selectedId;
                        return (
                            <Link
                                key={conv.id}
                                href={`?filter=${filter}${channelFilter ? `&channel=${channelFilter}` : ''}&conversationId=${conv.id}`}
                                className={cn(
                                    "relative group flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0",
                                    isActive && "bg-primary/5 border-l-4 border-l-primary pl-[13px]"
                                )}
                            >
                                {selectMode && (
                                    <ConversationCheckbox
                                        conversationId={conv.id}
                                        checked={selected.has(conv.id)}
                                        onToggle={toggleSelect}
                                    />
                                )}
                                <UnreadDot conversationId={conv.id} />
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700">{conv.contact?.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm truncate text-foreground">{conv.contact?.name || 'Usuario Desconocido'}</span>
                                        <div className="flex items-center gap-1 ml-2">
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                            {!isAgent && !selectMode && <ConversationListActions conversationId={conv.id} />}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate mb-2">
                                        {lastMsg?.content || 'Nueva conversación'}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {conv.channel?.type === 'INSTAGRAM' ? (
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-pink-200 text-pink-600 bg-pink-50 font-normal flex items-center gap-1">
                                                <Instagram className="h-3 w-3" /> Instagram
                                            </Badge>
                                        ) : conv.channel?.type === 'WHATSAPP' ? (
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-200 text-green-600 bg-green-50 font-normal flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> WhatsApp
                                            </Badge>
                                        ) : conv.channel?.type === 'WEB_CHAT' ? (
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-600 bg-blue-50 font-normal flex items-center gap-1">
                                                <Globe className="h-3 w-3" /> Web Chat
                                            </Badge>
                                        ) : conv.channel?.type ? (
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-gray-200 text-gray-500 font-normal">
                                                {conv.channel.type}
                                            </Badge>
                                        ) : null}
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

            <BulkDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                count={selected.size}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
            />
        </>
    );
}
