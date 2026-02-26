import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    RECHARGE: { label: 'Recarga', variant: 'default' },
    AI_USAGE: { label: 'Consumo IA', variant: 'secondary' },
    MANUAL_ADJUST: { label: 'Ajuste manual', variant: 'outline' },
    REFUND: { label: 'Reembolso', variant: 'default' },
};

function formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default async function CreditsHistoryPage() {
    const session = await auth();
    const companyId = session?.user?.companyId;

    if (!companyId) {
        return <p>No autorizado</p>;
    }

    const [transactions, company] = await Promise.all([
        prisma.creditTransaction.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
        prisma.company.findUnique({
            where: { id: companyId },
            select: { creditBalance: true },
        }),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="../settings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">Historial de Créditos</h3>
                    <p className="text-sm text-muted-foreground">
                        Saldo actual: <span className="font-semibold">{formatCOP(company?.creditBalance || 0)}</span>
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transacciones</CardTitle>
                    <CardDescription>Historial de recargas, consumos y ajustes de créditos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Saldo después</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No hay transacciones aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => {
                                    const typeInfo = TYPE_LABELS[tx.type] || { label: tx.type, variant: 'outline' as const };
                                    return (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString('es-CO', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {tx.description || '-'}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.amount >= 0 ? '+' : ''}{formatCOP(tx.amount)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {formatCOP(tx.balanceAfter)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
