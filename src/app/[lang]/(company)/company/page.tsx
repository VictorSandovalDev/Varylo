import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, ArrowUpRight, Clock, Activity } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function CompanyDashboard() {
    const session = await auth();
    if (!session?.user?.companyId) return null;

    const companyId = session.user.companyId;

    // Fetch real metrics in parallel
    const [
        totalConversations,
        totalAgents,
        connectedChannels
    ] = await Promise.all([
        prisma.conversation.count({ where: { companyId } }),
        prisma.user.count({ where: { companyId, role: Role.AGENT } }),
        prisma.channel.count({ where: { companyId, status: 'CONNECTED' } })
    ]);

    // Placeholder values for metrics not yet tracked in DB
    const avgResponseTime = "0m"; // To be implemented with message timestamps
    const csatScore = "0.0"; // To be implemented with feedback system

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Conversaciones Totales
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Histórico de chats
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Agentes
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAgents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Miembros del equipo
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Canales Activos
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{connectedChannels || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Integraciones conectadas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Satisfacción (CSAT)
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{csatScore}</div>
                        <p className="text-xs text-muted-foreground">
                            Próximamente
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen de Actividad</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                            Gráfico de Actividad (Próximamente)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <p>No hay actividad reciente</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
