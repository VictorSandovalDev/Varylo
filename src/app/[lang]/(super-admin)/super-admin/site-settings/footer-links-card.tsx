'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateFooterAction } from './actions';
import type { FooterSection, FooterLink } from '@/lib/site-config';

const DEFAULT_SECTIONS: FooterSection[] = [
    {
        title: 'Producto',
        links: [
            { label: 'Funciones', href: '#features' },
            { label: 'Precios', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
        ],
    },
    {
        title: 'Empresa',
        links: [{ label: 'Nosotros', href: '#contact' }],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacidad', href: '/terms' },
            { label: 'Términos', href: '/terms' },
        ],
    },
];

const DEFAULT_COPYRIGHT = 'Varylo. Todos los derechos reservados.';

interface Props {
    initialSections: FooterSection[] | null;
    initialCopyright: string | null;
}

export function FooterLinksCard({ initialSections, initialCopyright }: Props) {
    const [sections, setSections] = useState<FooterSection[]>(
        initialSections || DEFAULT_SECTIONS
    );
    const [copyright, setCopyright] = useState(initialCopyright || DEFAULT_COPYRIGHT);
    const [saving, setSaving] = useState(false);

    function updateSection(idx: number, field: keyof FooterSection, value: string) {
        setSections((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    }

    function updateLink(sIdx: number, lIdx: number, field: keyof FooterLink, value: string) {
        setSections((prev) => {
            const next = [...prev];
            const links = [...next[sIdx].links];
            links[lIdx] = { ...links[lIdx], [field]: value };
            next[sIdx] = { ...next[sIdx], links };
            return next;
        });
    }

    function addLink(sIdx: number) {
        setSections((prev) => {
            const next = [...prev];
            next[sIdx] = {
                ...next[sIdx],
                links: [...next[sIdx].links, { label: '', href: '' }],
            };
            return next;
        });
    }

    function removeLink(sIdx: number, lIdx: number) {
        setSections((prev) => {
            const next = [...prev];
            next[sIdx] = {
                ...next[sIdx],
                links: next[sIdx].links.filter((_, i) => i !== lIdx),
            };
            return next;
        });
    }

    function addSection() {
        setSections((prev) => [...prev, { title: '', links: [{ label: '', href: '' }] }]);
    }

    function removeSection(idx: number) {
        setSections((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSave() {
        setSaving(true);
        try {
            const result = await updateFooterAction(sections, copyright);
            if (result.success) {
                toast.success('Footer actualizado');
            } else {
                toast.error(result.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al guardar el footer');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enlaces del Footer</CardTitle>
                <CardDescription>
                    Configura las secciones y enlaces que aparecen en el pie de página de la landing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                                value={section.title}
                                onChange={(e) => updateSection(sIdx, 'title', e.target.value)}
                                placeholder="Título de sección"
                                className="font-semibold"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSection(sIdx)}
                                className="shrink-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="pl-6 space-y-2">
                            {section.links.map((link, lIdx) => (
                                <div key={lIdx} className="flex items-center gap-2">
                                    <Input
                                        value={link.label}
                                        onChange={(e) => updateLink(sIdx, lIdx, 'label', e.target.value)}
                                        placeholder="Texto del enlace"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={link.href}
                                        onChange={(e) => updateLink(sIdx, lIdx, 'href', e.target.value)}
                                        placeholder="URL (ej: #features, /terms)"
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeLink(sIdx, lIdx)}
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addLink(sIdx)}
                                className="text-xs"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Agregar enlace
                            </Button>
                        </div>
                    </div>
                ))}

                <Button variant="outline" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar sección
                </Button>

                <div className="border-t pt-4 space-y-2">
                    <label className="text-sm font-medium">Texto de copyright</label>
                    <Input
                        value={copyright}
                        onChange={(e) => setCopyright(e.target.value)}
                        placeholder="Ej: Varylo. Todos los derechos reservados."
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Guardar cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
