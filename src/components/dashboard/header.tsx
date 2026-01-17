'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
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

export function DashboardHeader({ title }: { title: string }) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] dark:bg-zinc-900">
            <Link className="lg:hidden" href="#">
                <span className="font-bold">VARYLO</span>
            </Link>
            <div className="w-full flex-1">
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
