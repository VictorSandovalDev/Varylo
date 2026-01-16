import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Métricas de la Plataforma</h3>
                <p className="text-sm text-muted-foreground">
                    Visión general del rendimiento de todas las empresas.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ingresos Mensuales
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Nuevas Empresas
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">
                            +20% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mensajes Procesados
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573,000</div>
                        <p className="text-xs text-muted-foreground">
                            +201 desde la última hora
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tasa de Retención
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.5%</div>
                        <p className="text-xs text-muted-foreground">
                            +1% desde la semana pasada
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Crecimiento de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                            Gráfico de Crecimiento (Placeholder)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Planes Más Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500 mr-2" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Pro Plan
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        65% de las empresas
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500 mr-2" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Scale Plan
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        25% de las empresas
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-indigo-500 mr-2" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Starter Plan
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        10% de las empresas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
