'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateChatbotFlow } from './actions';
import Link from 'next/link';
import type { ChatbotFlow, ChatbotFlowNode, ChatbotFlowOption } from '@/types/chatbot';

export function FlowEditor({
    chatbotId,
    initialFlow,
    backHref,
}: {
    chatbotId: string;
    initialFlow: ChatbotFlow;
    backHref: string;
}) {
    const [flow, setFlow] = useState<ChatbotFlow>(initialFlow);
    const [isPending, startTransition] = useTransition();
    const [saveResult, setSaveResult] = useState<string | null>(null);

    const nodeIds = Object.keys(flow.nodes);

    const addNode = () => {
        const id = `node_${Date.now()}`;
        const newNode: ChatbotFlowNode = {
            id,
            message: '',
            options: [],
        };
        setFlow(prev => ({
            ...prev,
            nodes: { ...prev.nodes, [id]: newNode },
        }));
    };

    const removeNode = (nodeId: string) => {
        if (nodeId === flow.startNodeId) {
            alert('No puedes eliminar el nodo inicial.');
            return;
        }
        setFlow(prev => {
            const newNodes = { ...prev.nodes };
            delete newNodes[nodeId];
            return { ...prev, nodes: newNodes };
        });
    };

    const updateNode = (nodeId: string, updates: Partial<ChatbotFlowNode>) => {
        setFlow(prev => ({
            ...prev,
            nodes: {
                ...prev.nodes,
                [nodeId]: { ...prev.nodes[nodeId], ...updates },
            },
        }));
    };

    const addOption = (nodeId: string) => {
        const node = flow.nodes[nodeId];
        const newOption: ChatbotFlowOption = {
            label: '',
            match: [],
            nextNodeId: flow.startNodeId,
        };
        updateNode(nodeId, {
            options: [...(node.options || []), newOption],
        });
    };

    const updateOption = (nodeId: string, optIndex: number, updates: Partial<ChatbotFlowOption>) => {
        const node = flow.nodes[nodeId];
        const options = [...(node.options || [])];
        options[optIndex] = { ...options[optIndex], ...updates };
        updateNode(nodeId, { options });
    };

    const removeOption = (nodeId: string, optIndex: number) => {
        const node = flow.nodes[nodeId];
        const options = (node.options || []).filter((_, i) => i !== optIndex);
        updateNode(nodeId, { options });
    };

    const handleSave = () => {
        setSaveResult(null);
        startTransition(async () => {
            const result = await updateChatbotFlow(chatbotId, flow);
            setSaveResult(result);
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Sticky top bar */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 -mt-3 border-b mb-2">
                <Link href={backHref}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    {saveResult && (
                        <div className={`flex items-center gap-1.5 text-sm ${saveResult.startsWith('Error') ? 'text-destructive' : 'text-green-600'}`}>
                            {saveResult.startsWith('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            <span className="hidden sm:inline">{saveResult}</span>
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? 'Guardando...' : 'Guardar Flujo'}
                    </Button>
                </div>
            </div>

            {/* Start node selector */}
            <div className="space-y-2">
                <Label>Nodo Inicial</Label>
                <Select
                    value={flow.startNodeId}
                    onValueChange={(value) => setFlow(prev => ({ ...prev, startNodeId: value }))}
                >
                    <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {nodeIds.map(id => (
                            <SelectItem key={id} value={id}>{id}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Node cards */}
            <div className="grid gap-4">
                {nodeIds.map(nodeId => {
                    const node = flow.nodes[nodeId];
                    const isStart = nodeId === flow.startNodeId;
                    return (
                        <Card key={nodeId} className={isStart ? 'border-primary shadow-sm' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-base flex items-center gap-2 min-w-0">
                                    {isStart && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded shrink-0">INICIO</span>
                                    )}
                                    <span className="font-mono text-sm text-muted-foreground truncate">{nodeId}</span>
                                </CardTitle>
                                {!isStart && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeNode(nodeId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Mensaje</Label>
                                    <Textarea
                                        value={node.message}
                                        onChange={(e) => updateNode(nodeId, { message: e.target.value })}
                                        rows={3}
                                        placeholder="Mensaje que se enviará al usuario..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Acción</Label>
                                    <Select
                                        value={node.action?.type || 'none'}
                                        onValueChange={(value) => {
                                            if (value === 'none') {
                                                updateNode(nodeId, { action: undefined });
                                            } else {
                                                updateNode(nodeId, {
                                                    action: { type: value as 'transfer_to_human' | 'transfer_to_ai_agent' | 'end_conversation' },
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-72">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin acción (continúa flujo)</SelectItem>
                                            <SelectItem value="transfer_to_human">Transferir a humano</SelectItem>
                                            <SelectItem value="transfer_to_ai_agent">Transferir a Agente IA</SelectItem>
                                            <SelectItem value="end_conversation">Finalizar conversación</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {!node.action && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Opciones</Label>
                                            <Button variant="outline" size="sm" onClick={() => addOption(nodeId)}>
                                                <Plus className="mr-1 h-3 w-3" />
                                                Agregar
                                            </Button>
                                        </div>
                                        {(node.options || []).map((option, optIndex) => (
                                            <div key={optIndex} className="space-y-3 bg-muted/50 p-3 rounded-md border">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Etiqueta</Label>
                                                        <Input
                                                            value={option.label}
                                                            onChange={(e) => updateOption(nodeId, optIndex, { label: e.target.value })}
                                                            placeholder="Ej. Información"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Keywords (coma)</Label>
                                                        <Input
                                                            value={option.match.join(', ')}
                                                            onChange={(e) => updateOption(nodeId, optIndex, {
                                                                match: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                                            })}
                                                            placeholder="1, info"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Nodo destino</Label>
                                                        <div className="flex gap-1">
                                                            <Select
                                                                value={option.nextNodeId}
                                                                onValueChange={(value) => updateOption(nodeId, optIndex, { nextNodeId: value })}
                                                            >
                                                                <SelectTrigger className="flex-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {nodeIds.map(id => (
                                                                        <SelectItem key={id} value={id}>{id}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeOption(nodeId, optIndex)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(node.options || []).length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-2">
                                                Sin opciones. Agrega una para que el usuario pueda responder.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Button variant="outline" onClick={addNode} className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Nodo
            </Button>
        </div>
    );
}
