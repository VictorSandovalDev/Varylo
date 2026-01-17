'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { getAnalyticsData } from './actions';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await getAnalyticsData();
                setData(result);
            } catch (error) {
                console.error("Failed to load analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!data) return <div>Error al cargar los datos</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-semibold">Resumen</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Conversaciones Abiertas */}
                <Card className="col-span-2 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-medium">Conversaciones abiertas</CardTitle>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">• En vivo</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4 pt-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Abrir</div>
                                <div className="text-3xl font-normal">{data.summary.open}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Desatendido</div>
                                <div className="text-3xl font-normal">{data.summary.unattended}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Sin asignar</div>
                                <div className="text-3xl font-normal">{data.summary.unassigned}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Pendientes</div>
                                <div className="text-3xl font-normal">{data.summary.pending}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estado del agente */}
                <Card className="col-span-1 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-medium">Estado del agente</CardTitle>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">• En vivo</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-2 pt-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">En línea</div>
                                <div className="text-3xl font-normal">{data.agentStatus.online}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Ocupado</div>
                                <div className="text-3xl font-normal">{data.agentStatus.busy}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Fuera de línea</div>
                                <div className="text-3xl font-normal">{data.agentStatus.offline}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tráfico de Conversación */}
            <Card className="shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">Tráfico de Conversación</CardTitle>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">• En vivo</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs">Últimos 7 días</Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs bg-muted/50">Descargar reporte</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex">
                        {/* Y-Axis Labels (Days) */}
                        <div className="flex flex-col justify-between pr-4 pb-6 min-w-[80px]">
                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day, i) => {
                                // Calculate correct date for label if needed, or just static list
                                // Let's try to match "Today" logic or just list past 7 days end to start?
                                // User mockup has explicit dates. We'll stick to static day names for MVP simplicity or map relative to today.
                                // Let's use a simple mapping for now.
                                return (
                                    <div key={day} className="h-8 flex flex-col justify-center items-end text-right">
                                        <span className="text-[10px] font-semibold">{day}</span>
                                        {/* <span className="text-[9px] text-muted-foreground">Date</span> */}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Grid */}
                        <div className="flex-1 space-y-1">
                            {/* Rows (Days) */}
                            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                                <div key={dayIndex} className="flex gap-1 h-8">
                                    {/* Cols (Hours) */}
                                    {Array.from({ length: 24 }).map((_, hourIndex) => {
                                        const count = data.heatmap[`${dayIndex}-${hourIndex}`] || 0;
                                        // Opacity based on count. Max count expected ~5-10 for small scale?
                                        const opacity = Math.min(1, count * 0.2);
                                        return (
                                            <div
                                                key={hourIndex}
                                                className={cn(
                                                    "flex-1 rounded-[2px]",
                                                    count > 0 ? "bg-primary" : "bg-muted/30"
                                                )}
                                                style={{ opacity: count > 0 ? Math.max(0.1, opacity) : 1 }}
                                                title={`Day ${dayIndex}, Hour ${hourIndex}: ${count} msgs`}
                                            />
                                        )
                                    })}
                                </div>
                            ))}

                            {/* X-Axis Labels (Hours) */}
                            <div className="flex justify-between pt-2 px-1">
                                {['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17', '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'].map((label, i) => (
                                    <span key={i} className="text-[8px] text-muted-foreground w-full text-center truncate">{label.split('-')[0]}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conversaciones por agentes */}
            <Card className="shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">Conversaciones por agentes</CardTitle>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">• En vivo</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        {/* Header */}
                        <div className="grid grid-cols-12 px-6 py-3 bg-muted/5 text-xs font-semibold text-muted-foreground">
                            <div className="col-span-6">Agente</div>
                            <div className="col-span-3">Abrir</div>
                            <div className="col-span-3">Desatendido</div>
                        </div>
                        {/* Rows */}
                        {data.conversationsByAgent.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">No hay agentes activos</div>
                        ) :
                            data.conversationsByAgent.map((agent: any) => (
                                <div key={agent.id} className="grid grid-cols-12 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/20 transition-colors">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{agent.avatar}</AvatarFallback>
                                            </Avatar>
                                            <span className={cn(
                                                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                                                agent.status === 'active' ? "bg-emerald-500" : "bg-neutral-300"
                                            )} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-foreground">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground">{agent.email}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-sm">{agent.openCount}</div>
                                    <div className="col-span-3 text-sm">{agent.unattendedCount}</div>
                                </div>
                            ))
                        }
                    </div>
                    {/* Footer Pagination */}
                    <div className="p-4 border-t flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Mostrando {data.conversationsByAgent.length} de {data.conversationsByAgent.length} resultados</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-primary text-primary-foreground">1</Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conversaciones por equipos */}
            <Card className="shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">Conversaciones por equipo</CardTitle>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">• En vivo</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        <div className="grid grid-cols-12 px-6 py-3 bg-muted/5 text-xs font-semibold text-muted-foreground">
                            <div className="col-span-6">Equipo</div>
                            <div className="col-span-3">Abrir</div>
                            <div className="col-span-3">Desatendido</div>
                        </div>
                        {/* Empty State */}
                        <div className="py-16 flex flex-col items-center justify-center space-y-1">
                            <div className="text-lg font-medium">No hay datos disponibles</div>
                        </div>
                    </div>
                    <div className="p-4 border-t flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Mostrando 0 de 0 resultados</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">10 / pág</Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" disabled><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

