'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, MessageSquare, Settings, CreditCard, BarChart3, Inbox } from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
    items: NavItem[];
    lang: string;
}

export function Sidebar({ items, lang }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 lg:block dark:bg-zinc-900 w-[240px] max-w-[280px]">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
                    <Link href={`/${lang}`} className="flex items-center gap-2 font-semibold">
                        <span className="">VARYLO</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium lg:px-6">
                        {items.map((item, index) => {
                            const localizedHref = `/${lang}${item.href}`;
                            const isActive = pathname === localizedHref;
                            return (
                                <Link
                                    key={index}
                                    href={localizedHref}
                                    className={clsx(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}

// Predefined Nav Items for Roles
export const superAdminItems: NavItem[] = [
    { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { title: 'Empresas', href: '/super-admin/companies', icon: Users },
    { title: 'Métricas', href: '/super-admin/analytics', icon: BarChart3 },
    { title: 'Planes', href: '/super-admin/billing', icon: CreditCard },
];

export const companyAdminItems: NavItem[] = [
    { title: 'Dashboard', href: '/company', icon: LayoutDashboard },
    { title: 'Conversaciones', href: '/company/conversations', icon: MessageSquare },
    { title: 'Agentes', href: '/company/agents', icon: Users },
    { title: 'Configuración', href: '/company/settings', icon: Settings },
];

export const agentItems: NavItem[] = [
    { title: 'Inbox', href: '/agent', icon: Inbox },
    { title: 'Perfil', href: '/agent/profile', icon: Settings }, // Changed to Settings as User icon was conflict
];
