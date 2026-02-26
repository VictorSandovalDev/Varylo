import { prisma } from '@/lib/prisma';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { EditCompanyDialog } from './edit-company-dialog';
import { CreateCompanyDialog } from './create-company-dialog';

export default async function CompaniesPage() {
    const companies = await prisma.company.findMany({
        include: {
            users: true,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Empresas Registradas</CardTitle>
                    <CardDescription>Gestión de todas las empresas en la plataforma.</CardDescription>
                </div>
                <CreateCompanyDialog />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Usuarios</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Fecha Registro</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                    No hay empresas registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {company.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{company.plan}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={company.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                            {company.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{company.users.length}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(company.creditBalance)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(company.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditCompanyDialog company={company} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
