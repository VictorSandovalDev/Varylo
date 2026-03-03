'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ScrollableTabs({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const check = () => {
            setCanScrollLeft(el.scrollLeft > 4);
            setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
        };

        check();
        el.addEventListener('scroll', check);
        window.addEventListener('resize', check);
        return () => {
            el.removeEventListener('scroll', check);
            window.removeEventListener('resize', check);
        };
    }, []);

    const scroll = (dir: number) => {
        ref.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
    };

    return (
        <div className="flex items-stretch">
            {canScrollLeft && (
                <button
                    onClick={() => scroll(-1)}
                    className="flex items-center px-1 text-muted-foreground hover:text-foreground transition-colors border-r"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}
            <div
                ref={ref}
                className="flex-1 flex px-4 gap-4 text-sm font-medium text-muted-foreground overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
            {canScrollRight && (
                <button
                    onClick={() => scroll(1)}
                    className="flex items-center px-1 text-muted-foreground hover:text-foreground transition-colors border-l"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
