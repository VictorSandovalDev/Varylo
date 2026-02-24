'use client';

import { useEffect, useState } from 'react';
import { useRealtimeData } from './realtime-context';
import { Clock } from 'lucide-react';

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function formatRemaining(ms: number): string {
    if (ms <= 0) return 'Expirada';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function WindowTimer({ conversationId }: { conversationId: string }) {
    const { conversations } = useRealtimeData();
    const [remaining, setRemaining] = useState<number | null>(null);

    const conv = conversations.find(c => c.id === conversationId);
    const lastInboundAt = conv?.lastInboundAt;

    useEffect(() => {
        if (!lastInboundAt) {
            setRemaining(null);
            return;
        }

        function compute() {
            const elapsed = Date.now() - new Date(lastInboundAt!).getTime();
            setRemaining(Math.max(0, WINDOW_MS - elapsed));
        }

        compute();
        const interval = setInterval(compute, 60_000);
        return () => clearInterval(interval);
    }, [lastInboundAt]);

    if (remaining === null) return null;

    const isExpired = remaining <= 0;
    const isLow = remaining > 0 && remaining < 2 * 60 * 60 * 1000; // < 2h

    return (
        <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isExpired
                    ? 'bg-red-100 text-red-700'
                    : isLow
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
            }`}
        >
            <Clock className="h-3 w-3" />
            {formatRemaining(remaining)}
        </div>
    );
}
