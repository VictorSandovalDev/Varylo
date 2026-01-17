'use client';

import { useActionState, useState } from 'react';
import { saveWhatsAppCredentials } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function WhatsAppConnectionForm({
    initialPhoneNumberId,
    initialVerifyToken,
    hasAccessToken
}: {
    initialPhoneNumberId?: string,
    initialVerifyToken?: string,
    hasAccessToken?: boolean
}) {
    const [state, action, isPending] = useActionState(saveWhatsAppCredentials, undefined);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const isSuccess = state?.startsWith('Success');
    const isError = state?.startsWith('Error');

    // Derived state: Connected if hasAccessToken OR if just successfully saved (optimistic update could be complex with useActionState, 
    // but usually page revalidation handles it. However, useActionState doesn't auto-refresh props without revalidation.
    // The server action calls revalidatePath, so props should update if this is a subcomponent of a RSC.
    // But we can fallback to isSuccess to switch view temporarily).
    const isConnected = hasAccessToken || isSuccess;

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const { testWhatsAppConnection } = await import('./actions');
            const result = await testWhatsAppConnection();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to run test.' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de que quieres desconectar WhatsApp? Dejarás de recibir mensajes.')) return;

        setIsDisconnecting(true);
        try {
            const { disconnectWhatsApp } = await import('./actions');
            await disconnectWhatsApp();
            // Props will update via revalidatePath
        } catch (error) {
            alert('Error al desconectar.');
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
                        <CardTitle className="text-green-700">WhatsApp Configurado</CardTitle>
                    </div>
                    <CardDescription>
                        Tu cuenta de WhatsApp Business está conectada y lista para recibir mensajes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                        <p className="font-mono text-sm">{initialPhoneNumberId}</p>
                    </div>

                    {testResult && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-md bg-background border ${testResult.success ? 'text-green-600 border-green-200' : 'text-destructive border-red-200'}`}>
                            {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {testResult.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={isTesting || isDisconnecting}
                        className="bg-background"
                    >
                        {isTesting ? 'Probando...' : 'Probar Conexión'}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting || isTesting}
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
                <CardTitle>Conexión de WhatsApp Business</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales de Meta for Developers para conectar tu número.
                </CardDescription>
            </CardHeader>
            <form action={action}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                        <Input
                            id="phoneNumberId"
                            name="phoneNumberId"
                            placeholder="Ej. 10456..."
                            defaultValue={initialPhoneNumberId}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accessToken">Permanent Access Token</Label>
                        <Input
                            id="accessToken"
                            name="accessToken"
                            type="password"
                            placeholder="EAAG..."
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="verifyToken">Verify Token (Webhook)</Label>
                        <Input
                            id="verifyToken"
                            name="verifyToken"
                            placeholder="MiTokenSecreto"
                            defaultValue={initialVerifyToken}
                            required
                        />
                    </div>

                    {isError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {state}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? 'Guardando...' : 'Conectar WhatsApp'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
