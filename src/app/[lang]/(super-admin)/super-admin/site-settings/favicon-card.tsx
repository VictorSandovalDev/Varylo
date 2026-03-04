'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateFaviconAction } from './actions';

const MAX_SIZE = 100 * 1024; // 100KB
const ACCEPTED_TYPES = ['image/png', 'image/x-icon', 'image/svg+xml', 'image/ico', 'image/vnd.microsoft.icon'];

export function FaviconCard({ currentFavicon }: { currentFavicon: string }) {
    const [preview, setPreview] = useState(currentFavicon);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.ico')) {
            toast.error('Solo se permiten archivos PNG, ICO o SVG');
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error('El archivo debe ser menor a 100KB');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/favicon', { method: 'POST', body: formData });
            const json = await res.json();

            if (!res.ok || !json.url) {
                toast.error(json.error || 'Error al subir el archivo');
                return;
            }

            const result = await updateFaviconAction(json.url);
            if (result.success) {
                setPreview(json.url);
                toast.success('Favicon actualizado');
            } else {
                toast.error(result.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al subir el favicon');
        } finally {
            setSaving(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Favicon</CardTitle>
                <CardDescription>
                    El ícono que aparece en la pestaña del navegador. PNG, ICO o SVG (máx. 100KB).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg border bg-muted">
                        <Image
                            src={preview}
                            alt="Favicon actual"
                            width={32}
                            height={32}
                            unoptimized
                        />
                    </div>
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".png,.ico,.svg"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            disabled={saving}
                            onClick={() => fileRef.current?.click()}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Cambiar favicon
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
