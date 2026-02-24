'use client';

import { createContext, useContext } from 'react';

export interface RealtimeConversation {
    id: string;
    lastMessageAt: string;
    lastInboundAt: string | null;
}

interface RealtimeData {
    unreadMap: Record<string, boolean>;
    conversations: RealtimeConversation[];
    totalUnread: number;
}

const RealtimeContext = createContext<RealtimeData>({
    unreadMap: {},
    conversations: [],
    totalUnread: 0,
});

export const RealtimeProvider = RealtimeContext.Provider;

export function useRealtimeData() {
    return useContext(RealtimeContext);
}
