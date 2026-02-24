'use client';

import { useRealtimeData } from './realtime-context';

export function UnreadDot({ conversationId }: { conversationId: string }) {
    const { unreadMap } = useRealtimeData();

    if (!unreadMap[conversationId]) return null;

    return (
        <span className="absolute top-4 right-3 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
    );
}
