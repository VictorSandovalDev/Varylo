import { auth } from '@/auth';
import { getContacts } from './actions';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Users,
    Plus,
    MapPin,
    Mail,
    Phone,
    MoreVertical,
    Globe,
    Instagram,
} from "lucide-react";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ContactsToolbar } from './contacts-toolbar';

export default async function ContactsPage(props: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ q?: string; filter?: string; channel?: string }>
}) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const session = await auth();
    if (!session) return null;

    const contacts = await getContacts(searchParams.q, searchParams.filter, searchParams.channel);
    const lang = params.lang;

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <ContactsToolbar
                search={searchParams.q || ''}
                filter={searchParams.filter || ''}
                channel={searchParams.channel || ''}
                contactIds={contacts.map(c => c.id)}
                totalCount={contacts.length}
            />

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {contacts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto pt-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No se encontraron contactos</h2>
                        <p className="text-muted-foreground">
                            {searchParams.q ? 'No hay resultados para tu búsqueda.' :
                             searchParams.channel ? 'No hay contactos en este canal.' :
                             'Empieza a añadir nuevos contactos o sincroniza tus canales.'}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-3">
                        {contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} lang={lang} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ContactCard({ contact, lang }: { contact: any, lang: string }) {
    const initials = (contact.name || contact.phone || '?').substring(0, 2).toUpperCase();
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-fuchsia-600', 'bg-orange-600', 'bg-rose-600'];
    const colorIndex = contact.name ? contact.name.length % colors.length : 0;
    const avatarColor = colors[colorIndex];

    const channelType = contact.conversations?.[0]?.channel?.type;

    return (
        <Card className="p-4 hover:shadow-md transition-shadow border-gray-200 bg-white group">
            <div className="flex items-center gap-4">
                <Avatar className={cn("h-10 w-10 shrink-0 border-none", avatarColor)}>
                    <AvatarFallback className="text-white font-medium text-xs">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-900 truncate">{contact.name || contact.phone}</h3>
                        {contact.companyName && (
                            <span className="text-sm text-gray-400 flex items-center gap-1 shrink-0">
                                <span className="opacity-50">|</span>
                                {contact.companyName}
                            </span>
                        )}
                        {channelType === 'WHATSAPP' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-200 text-green-600 bg-green-50 font-normal flex items-center gap-1">
                                <Phone className="h-3 w-3" /> WhatsApp
                            </Badge>
                        )}
                        {channelType === 'INSTAGRAM' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-pink-200 text-pink-600 bg-pink-50 font-normal flex items-center gap-1">
                                <Instagram className="h-3 w-3" /> Instagram
                            </Badge>
                        )}
                        {channelType === 'WEB_CHAT' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-600 bg-blue-50 font-normal flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Web
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {contact.email && (
                            <div className="flex items-center gap-1.5 min-w-[140px]">
                                <Mail className="h-3 w-3 opacity-50" />
                                <span className="truncate">{contact.email}</span>
                            </div>
                        )}
                        {!contact.phone?.startsWith('web_') && contact.phone !== contact.name?.replace('Visitante ', '') && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 opacity-50" />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                        {(contact.city || contact.country) && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 opacity-50" />
                                <span>{[contact.city, contact.country].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                        {contact.tags?.length > 0 && (
                            <div className="flex items-center gap-1 ml-auto">
                                {contact.tags.map((tag: any) => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 h-4 border-gray-200 bg-gray-50"
                                        style={{ borderLeft: `2px solid ${tag.color}` }}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <Link href={`/${lang}/company/contacts/${contact.id}`} className="text-xs text-primary hover:underline font-medium px-2 py-1">
                        Ver detalles
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><MoreVertical className="h-4 w-4" /></Button>
                </div>
            </div>
        </Card>
    );
}
