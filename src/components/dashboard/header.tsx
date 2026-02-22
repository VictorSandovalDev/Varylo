'use client';

import { Button } from '@/components/ui/button';
import { User, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, TagData } from './sidebar';
import { useState } from 'react';

interface DashboardHeaderProps {
    title: string;
    lang: string;
    role: 'super-admin' | 'company' | 'agent';
    tags?: TagData[];
}

export function DashboardHeader({ title, lang, role, tags = [] }: DashboardHeaderProps) {
    const [open, setOpen] = useState(false);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] dark:bg-zinc-900 justify-between lg:justify-end">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
                    <Sidebar
                        role={role}
                        lang={lang}
                        tags={tags}
                        className="border-none w-full"
                        onLinkClick={() => setOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1 lg:hidden">
                {/* Spacer or Title for mobile if needed, usually hidden on mobile header since Sidebar has logo */}
                <span className="font-bold ml-2">VARYLO</span>
            </div>

            <div className="hidden lg:flex w-full flex-1">
                <h1 className="text-lg font-semibold">{title}</h1>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Link href="/company/settings" className="w-full">
                            Perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
