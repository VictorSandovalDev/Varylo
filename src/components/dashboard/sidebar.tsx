'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, MessageSquare, Settings, CreditCard, BarChart3, Inbox, ChevronDown, ChevronRight, Tag, Bot, Workflow } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarUnreadBadge } from './unread-badge';


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
    className?: string; // Add className prop
    onLinkClick?: () => void; // Add callback for mobile close
}

export function Sidebar({ role, lang, tags, className, onLinkClick }: SidebarProps) {
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
        <div className={clsx("border-r bg-sidebar w-[240px] flex flex-col gap-2 h-full max-h-screen", className)}>
            <div className="flex h-14 items-center border-b border-sidebar-border px-6 lg:h-[60px] shrink-0">
                <Link href={`/${lang}`} className="flex items-center gap-2.5 font-semibold" onClick={onLinkClick}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">V</div>
                    <span className="text-sidebar-foreground">VARYLO</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium lg:px-6">
                    {items.map((item, index) => (
                        <SidebarItem key={index} item={item} lang={lang} pathname={pathname} onLinkClick={onLinkClick} />
                    ))}
                </nav>
            </div>
        </div>
    );
}

function SidebarItem({ item, lang, pathname, onLinkClick }: { item: NavItem, lang: string, pathname: string, onLinkClick?: () => void }) {
    const localizedHref = `/${lang}${item.href}`;
    const isActive = pathname === localizedHref || (item.children && item.children.some(child => pathname === `/${lang}${child.href}`));
    const [isOpen, setIsOpen] = useState(isActive);

    const showUnreadBadge = item.title === 'Conversaciones' || (item.title === 'Inbox' && item.href === '/agent');

    if (item.children) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <button
                        className={clsx(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all",
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                            {showUnreadBadge && <SidebarUnreadBadge />}
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
                                onClick={onLinkClick} // Close sidebar on mobile
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                    isChildActive ? "text-sidebar-accent-foreground font-medium bg-sidebar-accent/60" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
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
            onClick={onLinkClick} // Close sidebar on mobile
            className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
        >
            <item.icon className="h-4 w-4" />
            {item.title}
            {showUnreadBadge && <SidebarUnreadBadge />}
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
    { title: 'Agentes IA', href: '/company/ai-agents', icon: Bot },
    { title: 'Chatbots', href: '/company/chatbots', icon: Workflow },
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
