'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, CheckCircle2, MessageCircle, User, Bot, XCircle, Pencil } from "lucide-react";
import { updateChatbotFlow } from './actions';
import Link from 'next/link';
import type { ChatbotFlow, ChatbotFlowNode, ChatbotFlowOption } from '@/types/chatbot';

function generateId() {
    return `paso_${Math.random().toString(36).substring(2, 8)}`;
}

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
    const [editingName, setEditingName] = useState<string | null>(null);
    const [nodeNames, setNodeNames] = useState<Record<string, string>>(() => {
        const names: Record<string, string> = {};
        Object.keys(initialFlow.nodes).forEach((id, i) => {
            if (id === initialFlow.startNodeId) {
                names[id] = 'Bienvenida';
            } else {
                const node = initialFlow.nodes[id];
                if (node.action?.type === 'transfer_to_human') names[id] = 'Transferir a agente';
                else if (node.action?.type === 'transfer_to_ai_agent') names[id] = 'Transferir a IA';
                else if (node.action?.type === 'end_conversation') names[id] = 'Fin conversación';
                else names[id] = node.message?.substring(0, 30) || `Paso ${i + 1}`;
            }
        });
        return names;
    });

    // Always show start node first, then the rest in original order
    const nodeIds = [
        flow.startNodeId,
        ...Object.keys(flow.nodes).filter(id => id !== flow.startNodeId),
    ];

    const getNodeLabel = (nodeId: string) => {
        return nodeNames[nodeId] || nodeId;
    };

    const addNode = () => {
        const id = generateId();
        const newNode: ChatbotFlowNode = {
            id,
            message: '',
            options: [],
        };
        setFlow(prev => ({
            ...prev,
            nodes: { ...prev.nodes, [id]: newNode },
        }));
        setNodeNames(prev => ({ ...prev, [id]: `Paso ${nodeIds.length + 1}` }));
    };

    const removeNode = (nodeId: string) => {
        if (nodeId === flow.startNodeId) return;
        setFlow(prev => {
            const newNodes = { ...prev.nodes };
            delete newNodes[nodeId];
            // Clean up references to deleted node
            Object.values(newNodes).forEach(node => {
                if (node.options) {
                    node.options = node.options.map(opt =>
                        opt.nextNodeId === nodeId ? { ...opt, nextNodeId: prev.startNodeId } : opt
                    );
                }
            });
            return { ...prev, nodes: newNodes };
        });
        setNodeNames(prev => {
            const newNames = { ...prev };
            delete newNames[nodeId];
            return newNames;
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
        const optionNumber = (node.options?.length || 0) + 1;
        const newOption: ChatbotFlowOption = {
            label: `Opción ${optionNumber}`,
            match: [String(optionNumber)],
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
        const options = (node.options || [])
            .filter((_, i) => i !== optIndex)
            .map((opt, newIndex) => {
                // Regenerate match arrays with correct new number
                const visibleNumber = String(newIndex + 1);
                const fullLabel = opt.label.toLowerCase().trim();
                const words = fullLabel.split(/\s+/).filter(w => w.length >= 2);
                const matchSet = new Set([visibleNumber, ...(fullLabel ? [fullLabel] : []), ...words]);
                return { ...opt, match: Array.from(matchSet) };
            });
        updateNode(nodeId, { options });
    };

    const handleSave = () => {
        setSaveResult(null);
        startTransition(async () => {
            const result = await updateChatbotFlow(chatbotId, flow);
            setSaveResult(result);
        });
    };

    const getActionIcon = (type?: string) => {
        switch (type) {
            case 'transfer_to_human': return <User className="h-4 w-4" />;
            case 'transfer_to_ai_agent': return <Bot className="h-4 w-4" />;
            case 'end_conversation': return <XCircle className="h-4 w-4" />;
            default: return <MessageCircle className="h-4 w-4" />;
        }
    };

    const getActionLabel = (type?: string) => {
        switch (type) {
            case 'transfer_to_human': return 'Transfiere a un agente humano';
            case 'transfer_to_ai_agent': return 'Transfiere al agente IA';
            case 'end_conversation': return 'Finaliza la conversación';
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 border-b">
                <Link href={backHref}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    {saveResult && (
                        <div className={`flex items-center gap-1.5 text-sm ${saveResult.startsWith('Error') ? 'text-destructive' : 'text-green-600'}`}>
                            {saveResult.startsWith('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            <span className="hidden sm:inline">{saveResult.replace('Success: ', '').replace('Error: ', '')}</span>
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={isPending} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Cómo funciona el editor de flujos</p>
                <p className="text-blue-600 dark:text-blue-300">
                    Cada <strong>paso</strong> es un mensaje que el chatbot envía. Puedes agregar <strong>opciones</strong> para que el cliente elija qué hacer.
                    Cada opción lleva a otro paso. También puedes hacer que un paso <strong>transfiera</strong> a un agente humano o a la IA.
                </p>
            </div>

            {/* Visual flow */}
            <div className="space-y-3">
                {nodeIds.map((nodeId, nodeIndex) => {
                    const node = flow.nodes[nodeId];
                    const isStart = nodeId === flow.startNodeId;
                    const hasAction = !!node.action;

                    return (
                        <div key={nodeId}>
                            {/* Connector arrow */}
                            {nodeIndex > 0 && (
                                <div className="flex justify-center py-1">
                                    <div className="w-px h-6 bg-border" />
                                </div>
                            )}

                            <Card className={`relative ${isStart ? 'border-primary ring-1 ring-primary/20' : ''} ${hasAction ? 'border-orange-300 dark:border-orange-700' : ''}`}>
                                {/* Node header */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isStart ? 'bg-primary text-primary-foreground' : hasAction ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300' : 'bg-muted text-muted-foreground'}`}>
                                            {getActionIcon(node.action?.type)}
                                        </div>
                                        <div className="min-w-0">
                                            {editingName === nodeId ? (
                                                <Input
                                                    autoFocus
                                                    className="h-7 text-sm font-semibold w-48"
                                                    value={nodeNames[nodeId] || ''}
                                                    onChange={(e) => setNodeNames(prev => ({ ...prev, [nodeId]: e.target.value }))}
                                                    onBlur={() => setEditingName(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingName(null)}
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => setEditingName(nodeId)}
                                                    className="flex items-center gap-1.5 text-left hover:bg-muted rounded px-1.5 py-0.5 -ml-1.5 transition-colors"
                                                >
                                                    <span className="font-semibold text-sm truncate">{getNodeLabel(nodeId)}</span>
                                                    <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
                                                </button>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                {isStart && <Badge variant="default" className="text-[10px] h-4 px-1.5">INICIO</Badge>}
                                                {hasAction && <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-orange-300 text-orange-600">{getActionLabel(node.action?.type)}</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {!isStart && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeNode(nodeId)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="space-y-4 pt-2">
                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">Mensaje del chatbot</Label>
                                        <Textarea
                                            value={node.message}
                                            onChange={(e) => updateNode(nodeId, { message: e.target.value })}
                                            rows={2}
                                            placeholder="Escribe el mensaje que verá el cliente..."
                                            className="resize-none"
                                        />
                                    </div>

                                    {/* Action selector */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">Qué hace este paso?</Label>
                                        <select
                                            value={node.action?.type || 'show_options'}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === 'show_options') {
                                                    updateNode(nodeId, { action: undefined });
                                                } else {
                                                    updateNode(nodeId, {
                                                        action: { type: value as 'transfer_to_human' | 'transfer_to_ai_agent' | 'end_conversation' },
                                                        options: [],
                                                    });
                                                }
                                            }}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="show_options">Mostrar opciones al cliente</option>
                                            <option value="transfer_to_human">Transferir a agente humano</option>
                                            <option value="transfer_to_ai_agent">Transferir a agente IA</option>
                                            <option value="end_conversation">Finalizar conversación</option>
                                        </select>
                                    </div>

                                    {/* Options (only if no terminal action) */}
                                    {!node.action && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs text-muted-foreground">Opciones para el cliente</Label>
                                            </div>

                                            {(node.options || []).map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2 bg-muted/40 rounded-lg p-2.5 group">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                                        {optIndex + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2">
                                                        <Input
                                                            value={option.label}
                                                            onChange={(e) => {
                                                                const label = e.target.value;
                                                                const visibleNumber = String(optIndex + 1);
                                                                const fullLabel = label.toLowerCase().trim();
                                                                const words = fullLabel.split(/\s+/).filter(w => w.length >= 2);
                                                                const matchSet = new Set([visibleNumber, ...(fullLabel ? [fullLabel] : []), ...words]);
                                                                updateOption(nodeId, optIndex, {
                                                                    label,
                                                                    match: Array.from(matchSet),
                                                                });
                                                            }}
                                                            placeholder="Texto de la opción"
                                                            className="h-8 text-sm"
                                                        />
                                                        <select
                                                            value={option.nextNodeId}
                                                            onChange={(e) => updateOption(nodeId, optIndex, { nextNodeId: e.target.value })}
                                                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        >
                                                            {nodeIds.filter(id => id !== nodeId).map(id => (
                                                                <option key={id} value={id}>
                                                                    &#8594; {getNodeLabel(id)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                        onClick={() => removeOption(nodeId, optIndex)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addOption(nodeId)}
                                                className="w-full text-muted-foreground hover:text-foreground border border-dashed h-9"
                                            >
                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                Agregar opción
                                            </Button>
                                        </div>
                                    )}

                                    {/* Preview of what user sees */}
                                    {node.message && !node.action && (node.options?.length || 0) > 0 && (
                                        <div className="border rounded-lg p-3 bg-muted/20">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Vista previa del cliente</p>
                                            <div className="bg-background rounded-lg p-3 shadow-sm border text-sm space-y-2">
                                                <p>{node.message}</p>
                                                <div className="border-t pt-2 space-y-1">
                                                    {(node.options || []).map((opt, i) => (
                                                        <p key={i} className="text-muted-foreground">
                                                            <span className="font-medium text-foreground">{i + 1}.</span> {opt.label}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Add step button */}
            <Button variant="outline" onClick={addNode} className="w-full border-dashed h-12 text-muted-foreground hover:text-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Agregar nuevo paso
            </Button>

            {/* Bottom save */}
            <div className="flex justify-end pb-6">
                <Button onClick={handleSave} disabled={isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {isPending ? 'Guardando...' : 'Guardar flujo'}
                </Button>
            </div>
        </div>
    );
}
