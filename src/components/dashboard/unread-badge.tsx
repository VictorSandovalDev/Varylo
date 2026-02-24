'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const POLL_INTERVAL = 15000;
const STORAGE_KEY = 'varylo_read_timestamps';

function getReadTimestamps(): Record<string, number> {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

export function SidebarUnreadBadge() {
    const [count, setCount] = useState(0);
    const cachedConversationsRef = useRef<{ id: string; lastMessageAt: string }[]>([]);

    // Recompute unread count from cached data (no fetch needed)
    const recompute = useCallback(() => {
        const readMap = getReadTimestamps();
        let unread = 0;
        for (const conv of cachedConversationsRef.current) {
            const lastMsg = new Date(conv.lastMessageAt).getTime();
            const readAt = readMap[conv.id] || 0;
            if (lastMsg > readAt) unread++;
        }
        setCount(unread);
    }, []);

    useEffect(() => {
        async function poll() {
            try {
                const res = await fetch('/api/conversations/updates');
                if (!res.ok) return;
                const data = await res.json();
                cachedConversationsRef.current = data.conversations;
                recompute();
            } catch {
                // ignore
            }
        }

        poll();
        const interval = setInterval(poll, POLL_INTERVAL);

        // Listen for read-state changes from conversations page
        const handleReadUpdate = () => recompute();
        window.addEventListener('varylo-read-update', handleReadUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('varylo-read-update', handleReadUpdate);
        };
    }, [recompute]);

    if (count === 0) return null;

    return (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
        </span>
    );
}
