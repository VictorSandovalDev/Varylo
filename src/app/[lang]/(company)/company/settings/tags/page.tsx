import { getTags } from './actions';
import { AddTagDialog } from './add-tag-dialog';
import { Button } from "@/components/ui/button";
import { Tag as TagIcon, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default async function TagsPage() {
    const tags = await getTags();

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">Etiquetas</h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Las etiquetas le ayudan a clasificar y priorizar conversaciones y clientes potenciales.
                        Puede asignar una etiqueta a una conversación o contacto usando el panel lateral.
                    </p>
                    <a href="#" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
                        Aprende más sobre etiquetas &gt;
                    </a>
                </div>
                <AddTagDialog>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                        <Plus className="h-4 w-4" /> Añadir etiqueta
                    </Button>
                </AddTagDialog>
            </div>

            <div className="space-y-4">
                {tags.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                        <TagIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg">No hay etiquetas disponibles en esta cuenta.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border divide-y">
                        {tags.map((tag: any) => (
                            <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-4 w-4 rounded dark:bg-zinc-800 border"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <div>
                                        <div className="font-medium text-sm">{tag.name}</div>
                                        {tag.description && <div className="text-xs text-muted-foreground">{tag.description}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Actions Edit/Delete could go here */}
                                    {tag.showInSidebar && <Badge variant="secondary" className="text-[10px]">Barra lateral</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
