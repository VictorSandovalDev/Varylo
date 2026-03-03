'use client';

import { useState } from 'react';
import { initiateGoogleCalendarConnect, disconnectGoogleCalendar } from './actions';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";

export function GoogleCalendarForm({
    isConnected,
    email,
    connectedAt,
}: {
    isConnected: boolean;
    email?: string | null;
    connectedAt?: string | null;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const result = await initiateGoogleCalendarConnect();
            if (result.url) {
                window.location.href = result.url;
            } else {
                alert(result.error || 'Error al iniciar conexión con Google Calendar.');
                setIsLoading(false);
            }
        } catch {
            alert('Error al conectar con Google Calendar.');
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de que quieres desconectar Google Calendar? Los agentes IA ya no podrán agendar reuniones.')) return;
        setIsDisconnecting(true);
        try {
            await disconnectGoogleCalendar();
        } catch {
            alert('Error al desconectar Google Calendar.');
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (isConnected) {
        return (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <CardTitle className="text-green-700">Google Calendar Conectado</CardTitle>
                    </div>
                    <CardDescription>
                        Tus agentes IA pueden consultar disponibilidad y agendar reuniones automáticamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {email && (
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Cuenta conectada</Label>
                            <p className="text-sm">{email}</p>
                        </div>
                    )}
                    {connectedAt && (
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Conectado desde</Label>
                            <p className="text-sm">{new Date(connectedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                    >
                        {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <CardTitle>Google Calendar</CardTitle>
                </div>
                <CardDescription>
                    Conecta tu Google Calendar para que los agentes IA puedan consultar disponibilidad y agendar reuniones con tus clientes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleConnect} disabled={isLoading} className="w-full">
                    {isLoading ? 'Conectando...' : 'Conectar Google Calendar'}
                </Button>
            </CardContent>
        </Card>
    );
}
