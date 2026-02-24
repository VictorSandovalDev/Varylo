'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RealtimeProvider, type RealtimeConversation } from './realtime-context';

const POLL_INTERVAL = 5000;
const STORAGE_KEY = 'varylo_read_timestamps';

function getReadTimestamps(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function setReadTimestamp(conversationId: string) {
    const map = getReadTimestamps();
    map[conversationId] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function ConversationsRealtimeWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('conversationId');

    const fingerprintRef = useRef<string | null>(null);
    const [conversations, setConversations] = useState<RealtimeConversation[]>([]);
    const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Pre-load audio
    useEffect(() => {
        audioRef.current = new Audio('/sounds/notification.wav');
        audioRef.current.volume = 0.5;
    }, []);

    // Mark selected conversation as read
    useEffect(() => {
        if (selectedId) {
            setReadTimestamp(selectedId);
            setUnreadMap(prev => {
                if (!prev[selectedId]) return prev;
                const next = { ...prev };
                delete next[selectedId];
                return next;
            });
        }
    }, [selectedId]);

    const poll = useCallback(async () => {
        try {
            const res = await fetch('/api/conversations/updates');
            if (!res.ok) return;
            const data = await res.json();

            const newFingerprint: string = data.fingerprint;
            const newConversations: RealtimeConversation[] = data.conversations;

            // Compute unread map
            const readMap = getReadTimestamps();
            const newUnreadMap: Record<string, boolean> = {};
            for (const conv of newConversations) {
                const lastMsg = new Date(conv.lastMessageAt).getTime();
                const readAt = readMap[conv.id] || 0;
                if (lastMsg > readAt && conv.id !== selectedId) {
                    newUnreadMap[conv.id] = true;
                }
            }
            setUnreadMap(newUnreadMap);
            setConversations(newConversations);

            // If fingerprint changed, refresh server components and play sound
            if (fingerprintRef.current !== null && fingerprintRef.current !== newFingerprint) {
                router.refresh();
                // Play notification sound
                try {
                    audioRef.current?.play().catch(() => { /* browser may block autoplay */ });
                } catch { /* ignore */ }
            }

            fingerprintRef.current = newFingerprint;
        } catch {
            // Silently ignore polling errors
        }
    }, [router, selectedId]);

    useEffect(() => {
        // Initial poll
        poll();
        const interval = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [poll]);

    const totalUnread = Object.keys(unreadMap).length;

    return (
        <RealtimeProvider value={{ unreadMap, conversations, totalUnread }}>
            {children}
        </RealtimeProvider>
    );
}
