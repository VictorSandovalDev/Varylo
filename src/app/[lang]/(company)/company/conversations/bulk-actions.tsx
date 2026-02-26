'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Trash2, X, CheckSquare } from 'lucide-react';
import { deleteConversations } from './actions';
import { toast } from 'sonner';

interface BulkActionsProps {
    conversationIds: string[];
}

export function BulkActions({ conversationIds }: BulkActionsProps) {
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === conversationIds.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(conversationIds));
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const result = await deleteConversations(Array.from(selected));
        setIsDeleting(false);
        if (result.success) {
            toast.success(`${result.count} conversaciones eliminadas`);
            setSelected(new Set());
            setSelectMode(false);
            setShowDeleteDialog(false);
            router.refresh();
        } else {
            toast.error(result.message || 'Error al eliminar');
        }
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelected(new Set());
    };

    return { selectMode, selected, toggleSelect, toggleAll, exitSelectMode, setSelectMode, showDeleteDialog, setShowDeleteDialog, isDeleting, handleDelete };
}

// Toolbar component
export function BulkToolbar({
    selectMode,
    selectedCount,
    totalCount,
    onToggleAll,
    onDelete,
    onExit,
    onEnter,
}: {
    selectMode: boolean;
    selectedCount: number;
    totalCount: number;
    onToggleAll: () => void;
    onDelete: () => void;
    onExit: () => void;
    onEnter: () => void;
}) {
    if (!selectMode) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={onEnter}
                className="h-7 px-2 text-xs text-muted-foreground"
            >
                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                Seleccionar
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Checkbox
                checked={selectedCount === totalCount && totalCount > 0}
                onCheckedChange={onToggleAll}
                className="h-3.5 w-3.5"
            />
            <span className="text-xs text-muted-foreground">{selectedCount} sel.</span>
            {selectedCount > 0 && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    className="h-7 px-2 text-xs"
                >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onExit} className="h-7 px-2 text-xs">
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// Checkbox for each conversation row
export function ConversationCheckbox({
    conversationId,
    checked,
    onToggle,
}: {
    conversationId: string;
    checked: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <div
            className="shrink-0"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(conversationId);
            }}
        >
            <Checkbox checked={checked} className="h-4 w-4" />
        </div>
    );
}

// Delete confirmation dialog
export function BulkDeleteDialog({
    open,
    onOpenChange,
    count,
    isDeleting,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    count: number;
    isDeleting: boolean;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar {count} conversaciones?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán todos los mensajes de las conversaciones seleccionadas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Eliminando...' : `Eliminar ${count}`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
