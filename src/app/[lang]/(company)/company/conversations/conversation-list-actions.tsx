'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2, RotateCcw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteConversation, reopenConversation } from './actions';

export function ConversationListActions({ conversationId, status, isAgent }: { conversationId: string; status: string; isAgent?: boolean }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showReopenDialog, setShowReopenDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReopening, setIsReopening] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteConversation(conversationId);
        setIsDeleting(false);
        if (result.success) {
            setShowDeleteDialog(false);
            router.refresh();
        }
    }

    async function handleReopen() {
        setIsReopening(true);
        const result = await reopenConversation(conversationId);
        setIsReopening(false);
        if (result.success) {
            setShowReopenDialog(false);
            router.refresh();
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.preventDefault()}
                >
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                    {status === 'RESOLVED' && (
                        <DropdownMenuItem
                            className="text-amber-700 focus:text-amber-700"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowReopenDialog(true);
                            }}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reabrir
                        </DropdownMenuItem>
                    )}
                    {!isAgent && (
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowDeleteDialog(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Reabrir conversación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Reabrir esta conversación puede generar un costo en Meta si la ventana de 24 horas ha expirado. Se requerirá enviar una plantilla para iniciar contacto.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isReopening}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReopen}
                            disabled={isReopening}
                        >
                            {isReopening ? 'Reabriendo...' : 'Reabrir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
