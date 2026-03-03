'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { reopenConversation } from './actions';

export function ReopenBanner({ conversationId }: { conversationId: string }) {
    const [isReopening, setIsReopening] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string;

    const handleReopen = async () => {
        setIsReopening(true);
        try {
            const result = await reopenConversation(conversationId);
            if (result.success) {
                router.push(`/${lang}/company/conversations?filter=mine&conversationId=${conversationId}`);
                router.refresh();
            } else {
                alert(result.message || 'Error al reabrir la conversación');
            }
        } catch {
            alert('Error inesperado al reabrir');
        } finally {
            setIsReopening(false);
        }
    };

    return (
        <div className="p-4 bg-card border-t">
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Esta conversación está finalizada. Reabre la conversación para enviar mensajes.</span>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="shrink-0 gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-100" disabled={isReopening}>
                            {isReopening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                            Reabrir
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Reabrir conversación?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Reabrir esta conversación puede generar un costo en Meta si la ventana de 24 horas ha expirado. Se requerirá enviar una plantilla para iniciar contacto.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReopen} disabled={isReopening}>
                                {isReopening ? 'Reabriendo...' : 'Reabrir'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
