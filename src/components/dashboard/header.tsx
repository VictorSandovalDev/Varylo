'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function DashboardHeader({ title }: { title: string }) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] dark:bg-zinc-900">
            <Link className="lg:hidden" href="#">
                <span className="font-bold">VARYLO</span>
            </Link>
            <div className="w-full flex-1">
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut()}>
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
            </Button>
        </header>
    );
}
