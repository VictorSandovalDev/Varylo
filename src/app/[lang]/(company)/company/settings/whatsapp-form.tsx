'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";

// Extend window interface for FB SDK
declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export function WhatsAppConnectionForm({
    initialPhoneNumberId,
    initialWabaId,
    hasAccessToken
}: {
    initialPhoneNumberId?: string;
    initialWabaId?: string;
    hasAccessToken?: boolean;
}) {
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Embedded Signup state
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [justConnected, setJustConnected] = useState(false);

    const isConnected = hasAccessToken || justConnected;

    // Load FB SDK (same pattern as instagram-form.tsx)
    useEffect(() => {
        if (window.FB) {
            setSdkLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                cookie: true,
                xfbml: true,
                version: 'v21.0',
            });
            setSdkLoaded(true);
        };

        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }, []);

    // Listen for Embedded Signup session info via postMessage
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    // data.data contains { phone_number_id, waba_id }
                    if (data.data?.phone_number_id && data.data?.waba_id) {
                        // Store for use in the FB.login callback
                        (window as any).__waEmbeddedSignupData = data.data;
                    }
                }
            } catch {
                // Not a JSON message we care about
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleLogin = () => {
        if (!window.FB) return;

        setError(null);
        setIsConnecting(true);

        // Clear any previous session data
        (window as any).__waEmbeddedSignupData = null;

        const configId = process.env.NEXT_PUBLIC_WA_CONFIG_ID;

        window.FB.login(
            async (response: any) => {
                if (response.authResponse?.code) {
                    try {
                        // Grab session info captured via postMessage
                        const sessionInfo = (window as any).__waEmbeddedSignupData || {};

                        const { exchangeWhatsAppCode } = await import('./actions');
                        const result = await exchangeWhatsAppCode(
                            response.authResponse.code,
                            sessionInfo
                        );

                        if (result.success) {
                            setJustConnected(true);
                        } else {
                            setError(result.message);
                        }
                    } catch (err) {
                        setError('Error al procesar la conexión.');
                    }
                } else {
                    setError('Inicio de sesión cancelado o no autorizado.');
                }
                setIsConnecting(false);
            },
            {
                config_id: configId,
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    feature: 'whatsapp_embedded_signup',
                    sessionInfoVersion: 2,
                },
            }
        );
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const { testWhatsAppConnection } = await import('./actions');
            const result = await testWhatsAppConnection();
            setTestResult(result);
        } catch {
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
            setJustConnected(false);
        } catch {
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
                    {initialPhoneNumberId && (
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                            <p className="font-mono text-sm">{initialPhoneNumberId}</p>
                        </div>
                    )}
                    {initialWabaId && (
                        <div className="grid gap-1">
                            <Label className="text-xs text-muted-foreground">WABA ID</Label>
                            <p className="font-mono text-sm">{initialWabaId}</p>
                        </div>
                    )}

                    {testResult && (
                        <div className={cn(
                            "flex items-center gap-2 text-sm p-3 rounded-md bg-background border",
                            testResult.success ? "text-green-600 border-green-200" : "text-destructive border-red-200"
                        )}>
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
                    Conecta tu número de WhatsApp Business con un click.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    {!process.env.NEXT_PUBLIC_WA_CONFIG_ID && (
                        <div className="w-full text-center p-2 text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-2">
                            Falta NEXT_PUBLIC_WA_CONFIG_ID en .env
                        </div>
                    )}
                    <Button
                        type="button"
                        onClick={handleLogin}
                        disabled={!sdkLoaded || isConnecting}
                        className="bg-[#1877F2] hover:bg-[#1864D9] text-white flex items-center gap-2 text-base h-12 px-6 shadow-sm"
                    >
                        <Facebook className="h-5 w-5" />
                        {isConnecting ? 'Conectando...' : 'Conectar con Facebook'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center max-w-sm">
                        Se abrirá una ventana para que conectes tu cuenta de WhatsApp Business directamente.
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
