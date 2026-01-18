'use strict';
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateCompany } from './actions';
import { Company } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface CompanyWithUsers extends Company {
    users: any[];
}

const formSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'El nombre es obligatorio'),
    plan: z.enum(['STARTER', 'PRO', 'SCALE']),
    status: z.enum(['ACTIVE', 'SUSPENDED']),
});

interface EditCompanyDialogProps {
    company: CompanyWithUsers;
}

export function EditCompanyDialog({ company }: EditCompanyDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: company.id,
            name: company.name,
            plan: company.plan,
            status: company.status,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const result = await updateCompany(values);
            if (result.success) {
                toast.success('Empresa actualizada correctamente');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Error al actualizar la empresa');
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    Administrar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Administrar Empresa</DialogTitle>
                    <DialogDescription>
                        Gestiona los detalles y usuarios de la empresa.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="users">Usuarios</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la Empresa</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Inc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plan</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="STARTER">Starter</SelectItem>
                                                    <SelectItem value="PRO">Pro</SelectItem>
                                                    <SelectItem value="SCALE">Scale</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un estado" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Guardar Cambios
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="users">
                        <div className="py-4">
                            {company.users && company.users.length > 0 ? (
                                <div className="space-y-4">
                                    {company.users.map((user: any) => (
                                        <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{user.name || 'Sin nombre'}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Badge variant={user.role === 'OWNER' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay usuarios registrados en esta empresa.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
