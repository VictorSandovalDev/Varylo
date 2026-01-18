'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, MessageSquare, Settings, CreditCard, BarChart3, Inbox, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"


export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}

export interface TagData {
    id: string;
    name: string;
    color: string;
    showInSidebar: boolean;
}

type SidebarRole = 'super-admin' | 'company' | 'agent';

interface SidebarProps {
    role: SidebarRole;
    lang: string;
    tags?: TagData[];
}

export function Sidebar({ role, lang, tags }: SidebarProps) {
    const pathname = usePathname();

    let items: NavItem[] = [];
    switch (role) {
        case 'super-admin':
            items = superAdminItems;
            break;
        case 'company':
            items = [...companyAdminItems];
            // Inject tags into Conversations and Contacts
            if (tags && tags.length > 0) {
                const sidebarTags = tags.filter(t => t.showInSidebar);
                if (sidebarTags.length > 0) {
                    const convIndex = items.findIndex(i => i.href === '/company/conversations');
                    if (convIndex !== -1) {
                        const baseItem = items[convIndex];
                        items[convIndex] = {
                            ...baseItem,
                            children: [
                                { title: 'Todas', href: '/company/conversations', icon: MessageSquare },
                                ...sidebarTags.map(tag => ({
                                    title: tag.name,
                                    href: `/company/conversations?filter=all&tag=${tag.id}`,
                                    icon: ({ className }: { className?: string }) => (
                                        <div
                                            className={className}
                                            style={{ backgroundColor: tag.color, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)' }}
                                        />
                                    )
                                }))
                            ]
                        };
                    }

                    const contactIndex = items.findIndex(i => i.href === '/company/contacts');
                    if (contactIndex !== -1) {
                        const baseItem = items[contactIndex];
                        items[contactIndex] = {
                            ...baseItem,
                            children: [
                                { title: 'Todos los contactos', href: '/company/contacts', icon: Users },
                                { title: 'Activos', href: '/company/contacts?filter=active', icon: Users }
                            ]
                        };
                    }
                }
            }
            break;
        case 'agent':
            items = agentItems;
            break;
        default:
            items = [];
    }

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
                        {items.map((item, index) => (
                            <SidebarItem key={index} item={item} lang={lang} pathname={pathname} />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ item, lang, pathname }: { item: NavItem, lang: string, pathname: string }) {
    const localizedHref = `/${lang}${item.href}`;
    const isActive = pathname === localizedHref || (item.children && item.children.some(child => pathname === `/${lang}${child.href}`));
    const [isOpen, setIsOpen] = useState(isActive);

    if (item.children) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <button
                        className={clsx(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all hover:text-primary",
                            isActive ? "bg-muted text-primary" : "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    {item.children.map((child, index) => {
                        const childHref = `/${lang}${child.href}`;
                        const isChildActive = pathname === childHref;
                        return (
                            <Link
                                key={index}
                                href={childHref}
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                                    isChildActive ? "text-primary font-semibold" : "text-muted-foreground"
                                )}
                            >
                                {child.icon && <child.icon className="h-4 w-4" />}
                                {child.title}
                            </Link>
                        )
                    })}
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        <Link
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
    {
        title: 'Analíticas',
        href: '/company/analytics',
        icon: BarChart3,
        children: [
            { title: 'Resumen', href: '/company/analytics', icon: BarChart3 }, // Using same icon for now, effectively hidden by UI logic usually or irrelevant
            { title: 'Conversaciones', href: '/company/analytics/conversations', icon: MessageSquare },
            { title: 'Agentes', href: '/company/analytics/agents', icon: Users },
            { title: 'Etiquetas', href: '/company/analytics/tags', icon: BarChart3 },
            { title: 'Bandeja de entrada', href: '/company/analytics/inbox', icon: Inbox },
            { title: 'Equipo', href: '/company/analytics/teams', icon: Users },
            { title: 'Encuestas', href: '/company/analytics/surveys', icon: BarChart3 },
            { title: 'SLA', href: '/company/analytics/sla', icon: BarChart3 },
        ]
    },
    { title: 'Conversaciones', href: '/company/conversations', icon: MessageSquare },
    {
        title: 'Contactos',
        href: '/company/contacts',
        icon: Users,
        children: [
            { title: 'Todos los contactos', href: '/company/contacts', icon: Users },
            { title: 'Activo', href: '/company/contacts?filter=active', icon: Users },
        ]
    },
    { title: 'Agentes', href: '/company/agents', icon: Users },
    {
        title: 'Configuración',
        href: '/company/settings',
        icon: Settings,
        children: [
            { title: 'General', href: '/company/settings', icon: Settings },
            { title: 'Etiquetas', href: '/company/settings/tags', icon: Tag },
        ]
    },
];

export const agentItems: NavItem[] = [
    { title: 'Inbox', href: '/agent', icon: Inbox },
    { title: 'Perfil', href: '/agent/profile', icon: Settings },
];
