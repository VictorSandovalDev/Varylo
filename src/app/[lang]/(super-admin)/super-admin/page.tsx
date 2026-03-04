import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Building2, Users, MessageSquare, Zap, DollarSign, Brain,
    TrendingUp, AlertTriangle, UserPlus, CreditCard,
} from 'lucide-react';
import { RevenueChart } from './_components/revenue-chart';
import { CompanyGrowthChart } from './_components/company-growth-chart';
import { MessageVolumeChart } from './_components/message-volume-chart';

export const dynamic = 'force-dynamic';

const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('es-CO').format(value);

export default async function SuperAdminDashboard() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [
        // KPI Cards
        activeCompanies,
        totalUsers,
        openConversations,
        messagesToday,
        revenueMonth,
        aiCostMonth,
        // Revenue chart (last 30 days)
        revenueTransactions,
        // Company distribution & growth
        planDistribution,
        companiesForGrowth,
        // Top 10 companies
        topCompanies,
        // Message volume (last 14 days)
        messagesForVolume,
        // Channel breakdown
        channelBreakdown,
        // AI consumption
        aiTotalStats,
        aiOwnKeyStats,
        aiTopCompanies,
        // Activity & alerts
        recentCompanies,
        lowCreditCompanies,
        suspendedCompanies,
    ] = await Promise.all([
        // 1. KPI Cards
        prisma.company.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count(),
        prisma.conversation.count({ where: { status: 'OPEN' } }),
        prisma.message.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.creditTransaction.aggregate({
            where: { type: 'RECHARGE', createdAt: { gte: startOfMonth } },
            _sum: { amount: true },
        }),
        prisma.aiUsageLog.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { costCop: true },
        }),
        // 2. Revenue chart
        prisma.creditTransaction.findMany({
            where: { type: 'RECHARGE', createdAt: { gte: thirtyDaysAgo } },
            select: { amount: true, createdAt: true },
        }),
        // 3. Plan distribution & company growth
        prisma.company.groupBy({ by: ['plan'], _count: { _all: true } }),
        prisma.company.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
        }),
        // 4. Top 10 companies
        prisma.company.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                plan: true,
                creditBalance: true,
                _count: {
                    select: {
                        users: true,
                        channels: true,
                    },
                },
            },
        }),
        // 5. Message volume (last 14 days)
        prisma.message.findMany({
            where: { createdAt: { gte: fourteenDaysAgo } },
            select: { direction: true, createdAt: true },
        }),
        // Channel breakdown
        prisma.channel.groupBy({
            by: ['type'],
            where: { status: 'CONNECTED' },
            _count: { _all: true },
        }),
        // 6. AI consumption
        prisma.aiUsageLog.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { totalTokens: true, costCop: true },
            _count: { _all: true },
        }),
        prisma.aiUsageLog.groupBy({
            by: ['usedOwnKey'],
            where: { createdAt: { gte: startOfMonth } },
            _count: { _all: true },
        }),
        prisma.aiUsageLog.groupBy({
            by: ['companyId'],
            where: { createdAt: { gte: startOfMonth } },
            _sum: { costCop: true },
            _count: { _all: true },
            orderBy: { _sum: { costCop: 'desc' } },
            take: 5,
        }),
        // 7. Activity & alerts
        prisma.company.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, name: true, plan: true, createdAt: true },
        }),
        prisma.company.findMany({
            where: { status: 'ACTIVE', creditBalance: { lt: 5000 } },
            select: { id: true, name: true, creditBalance: true },
            orderBy: { creditBalance: 'asc' },
            take: 10,
        }),
        prisma.company.findMany({
            where: { status: 'SUSPENDED' },
            select: { id: true, name: true, updatedAt: true },
        }),
    ]);

    // Get message counts for top companies (separate query for this month)
    const topCompanyIds = topCompanies.map((c) => c.id);
    const messageCountsByCompany = await prisma.message.groupBy({
        by: ['companyId'],
        where: { companyId: { in: topCompanyIds }, createdAt: { gte: startOfMonth } },
        _count: { _all: true },
    });
    const msgCountMap = new Map(messageCountsByCompany.map((m) => [m.companyId, m._count._all]));

    const topCompaniesSorted = topCompanies
        .map((c) => ({ ...c, messagesMonth: msgCountMap.get(c.id) || 0 }))
        .sort((a, b) => b.messagesMonth - a.messagesMonth)
        .slice(0, 10);

    // Resolve AI top company names
    const aiTopCompanyIds = aiTopCompanies.map((c) => c.companyId);
    const aiCompanyNames = await prisma.company.findMany({
        where: { id: { in: aiTopCompanyIds } },
        select: { id: true, name: true },
    });
    const aiNameMap = new Map(aiCompanyNames.map((c) => [c.id, c.name]));

    // Aggregate revenue by day for chart
    const revenueByDay = new Map<string, number>();
    for (const tx of revenueTransactions) {
        const day = tx.createdAt.toISOString().slice(0, 10);
        revenueByDay.set(day, (revenueByDay.get(day) || 0) + tx.amount);
    }
    const revenueChartData = Array.from(revenueByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date: date.slice(5), amount }));

    // Aggregate company growth by month
    const growthByMonth = new Map<string, number>();
    for (const c of companiesForGrowth) {
        const month = c.createdAt.toISOString().slice(0, 7);
        growthByMonth.set(month, (growthByMonth.get(month) || 0) + 1);
    }
    const growthChartData = Array.from(growthByMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));

    // Aggregate messages by day for chart
    const msgByDay = new Map<string, { inbound: number; outbound: number }>();
    for (const m of messagesForVolume) {
        const day = m.createdAt.toISOString().slice(0, 10);
        const entry = msgByDay.get(day) || { inbound: 0, outbound: 0 };
        if (m.direction === 'INBOUND') entry.inbound++;
        else entry.outbound++;
        msgByDay.set(day, entry);
    }
    const messageChartData = Array.from(msgByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ date: date.slice(5), ...vals }));

    // AI own key percentage
    const aiTotal = aiOwnKeyStats.reduce((acc, s) => acc + s._count._all, 0);
    const aiOwnKeyCount = aiOwnKeyStats.find((s) => s.usedOwnKey)?._count._all || 0;
    const aiOwnKeyPct = aiTotal > 0 ? ((aiOwnKeyCount / aiTotal) * 100).toFixed(1) : '0';

    // Plan distribution map
    const planMap = new Map(planDistribution.map((p) => [p.plan, p._count._all]));

    // Channel type colors
    const channelColors: Record<string, string> = {
        WHATSAPP: 'bg-green-100 text-green-800',
        INSTAGRAM: 'bg-pink-100 text-pink-800',
        MESSENGER: 'bg-blue-100 text-blue-800',
        TELEGRAM: 'bg-sky-100 text-sky-800',
        WEB_CHAT: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Resumen Global</h2>
                <p className="text-muted-foreground">Vista general del estado de la plataforma</p>
            </div>

            {/* Section 1: KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCompanies}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversaciones Abiertas</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openConversations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes Hoy</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(messagesToday)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCOP(revenueMonth._sum.amount || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Consumo IA (Mes)</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCOP(aiCostMonth._sum.costCop || 0)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 2: Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Ingresos por Recargas (Últimos 30 días)</CardTitle>
                </CardHeader>
                <CardContent>
                    <RevenueChart data={revenueChartData} />
                </CardContent>
            </Card>

            {/* Section 3: Plan Distribution + Company Growth */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Planes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(['STARTER', 'PRO', 'SCALE'] as const).map((plan) => {
                                const count = planMap.get(plan) || 0;
                                const total = activeCompanies || 1;
                                const pct = ((count / total) * 100).toFixed(1);
                                return (
                                    <div key={plan} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={plan === 'SCALE' ? 'default' : 'secondary'}>
                                                {plan}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">{pct}%</span>
                                        </div>
                                        <span className="text-lg font-semibold">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Crecimiento de Empresas (6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CompanyGrowthChart data={growthChartData} />
                    </CardContent>
                </Card>
            </div>

            {/* Section 4: Top 10 Companies */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Empresas por Mensajes (Este Mes)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 font-medium">Empresa</th>
                                    <th className="pb-2 font-medium">Plan</th>
                                    <th className="pb-2 font-medium text-right">Usuarios</th>
                                    <th className="pb-2 font-medium text-right">Canales</th>
                                    <th className="pb-2 font-medium text-right">Mensajes (Mes)</th>
                                    <th className="pb-2 font-medium text-right">Créditos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCompaniesSorted.map((company) => (
                                    <tr key={company.id} className="border-b last:border-0">
                                        <td className="py-2 font-medium">{company.name}</td>
                                        <td className="py-2">
                                            <Badge variant="outline">{company.plan}</Badge>
                                        </td>
                                        <td className="py-2 text-right">{company._count.users}</td>
                                        <td className="py-2 text-right">{company._count.channels}</td>
                                        <td className="py-2 text-right font-medium">{formatNumber(company.messagesMonth)}</td>
                                        <td className="py-2 text-right">{formatCOP(company.creditBalance)}</td>
                                    </tr>
                                ))}
                                {topCompaniesSorted.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                                            Sin empresas activas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Section 5: Message Volume + Channels */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Volumen de Mensajes (Últimos 14 días)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MessageVolumeChart data={messageChartData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Canales Conectados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {channelBreakdown.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin canales conectados</p>
                            )}
                            {channelBreakdown.map((ch) => (
                                <div key={ch.type} className="flex items-center justify-between">
                                    <Badge className={channelColors[ch.type] || 'bg-gray-100 text-gray-800'}>
                                        {ch.type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-lg font-semibold">{ch._count._all}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 6: AI Consumption */}
            <Card>
                <CardHeader>
                    <CardTitle>Consumo de IA (Este Mes)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Llamadas IA</p>
                            <p className="text-2xl font-bold">{formatNumber(aiTotalStats._count._all)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Tokens Totales</p>
                            <p className="text-2xl font-bold">{formatNumber(aiTotalStats._sum.totalTokens || 0)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Costo Total</p>
                            <p className="text-2xl font-bold">{formatCOP(aiTotalStats._sum.costCop || 0)}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Con Llave Propia</p>
                            <p className="text-2xl font-bold">{aiOwnKeyPct}%</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">Top 5 Empresas por Consumo IA</h4>
                        <div className="space-y-2">
                            {aiTopCompanies.map((entry) => (
                                <div key={entry.companyId} className="flex items-center justify-between rounded-lg border p-2">
                                    <span className="text-sm font-medium">
                                        {aiNameMap.get(entry.companyId) || entry.companyId}
                                    </span>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="text-muted-foreground">{entry._count._all} llamadas</span>
                                        <span className="font-semibold">{formatCOP(entry._sum.costCop || 0)}</span>
                                    </div>
                                </div>
                            ))}
                            {aiTopCompanies.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin consumo de IA este mes</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 7: Activity & Alerts */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Nuevas Empresas</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentCompanies.map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{c.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{c.plan}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {c.createdAt.toLocaleDateString('es-CO')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentCompanies.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin empresas recientes</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Créditos Bajos</CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {lowCreditCompanies.map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-amber-600 font-medium">{formatCOP(c.creditBalance)}</span>
                                </div>
                            ))}
                            {lowCreditCompanies.length === 0 && (
                                <p className="text-sm text-muted-foreground">Todas las empresas con saldo suficiente</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Suspendidas</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {suspendedCompanies.map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {c.updatedAt.toLocaleDateString('es-CO')}
                                    </span>
                                </div>
                            ))}
                            {suspendedCompanies.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin empresas suspendidas</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
