'use client';

import { useActionState, useState, useEffect } from 'react';
import { saveInstagramCredentials } from './actions';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Instagram, Facebook } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Extend window interface for FB SDK
declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export function InstagramConnectionForm({
    initialPageId,
    initialVerifyToken,
    hasAccessToken
}: {
    initialPageId?: string,
    initialVerifyToken?: string, // Legacy
    hasAccessToken?: boolean
}) {
    const [state, saveAction, isSaving] = useActionState(saveInstagramCredentials, undefined);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // OAuth State
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [userAccessToken, setUserAccessToken] = useState<string | null>(null);
    const [pages, setPages] = useState<any[]>([]);
    // We need both the Page ID and the specific Page Access Token
    const [selectedPageId, setSelectedPageId] = useState<string>('');
    const [selectedPageToken, setSelectedPageToken] = useState<string>('');
    const [isLoadingPages, setIsLoadingPages] = useState(false);

    const isSuccess = state?.startsWith('Success');
    const isError = state?.startsWith('Error');
    const isConnected = hasAccessToken || isSuccess;

    // Load FB SDK
    useEffect(() => {
        if (window.FB) {
            setSdkLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '1995848854645546', // Hardcoded
                cookie: true,
                xfbml: true,
                version: 'v20.0' // Upgrade to latest version
            });
            setSdkLoaded(true);
        };

        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }, []);

    const handleLogin = () => {
        if (!window.FB) return;

        // Permissions required for:
        // 1. Listing Pages (pages_show_list)
        // 2. Getting Page Access Token (pages_show_list + others)
        // 3. Managing messages (instagram_basic, instagram_manage_messages, pages_manage_metadata)
        window.FB.login((response: any) => {
            if (response.authResponse) {
                console.log('FB Login Success', response);
                setUserAccessToken(response.authResponse.accessToken);
                fetchPages(response.authResponse.userID, response.authResponse.accessToken);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {
            // Reduced scope for debugging. If this works, we'll add others back one by one.
            scope: 'pages_show_list,instagram_basic'
        });
    };

    const fetchPages = (userId: string, token: string) => {
        setIsLoadingPages(true);
        console.log('Fetching pages with token:', token.substring(0, 10) + '...');

        // Pass access_token explicitly as parameter
        window.FB.api('/me/accounts', 'get', {
            access_token: token,
            fields: 'name,access_token,instagram_business_account,id'
        }, (response: any) => {
            setIsLoadingPages(false);
            if (response && response.data) {
                console.log('Pages fetched:', response.data.length);
                setPages(response.data);
            } else {
                console.error('Error fetching pages:', response);
            }
        });
    };

    const handlePageSelection = (pageId: string) => {
        setSelectedPageId(pageId);
        // Find the page in our list to get its specific token
        const page = pages.find(p => p.id === pageId);
        if (page) {
            // Note: We prefer the Instagram Business Account ID if available, 
            // but the "Page ID" is technically the Facebook Page ID (page.id).
            // However, our backend logic for sending messages (actions.ts) now expects
            // `pageId` to be the Instagram Business ID (1784...) because that's what the API needs for the endpoint.

            // So let's store the IG Business ID as 'pageId' if it exists, otherwise fallback to Page ID (and hope user connected it)
            const igId = page.instagram_business_account?.id;

            // IMPORTANT: If igId is missing, this page isn't connected to IG properly for API usage.
            if (!igId) {
                alert("Esta página de Facebook no parece tener una cuenta de Instagram Business conectada. Por favor verifica en Facebook.");
            }

            // We'll submit the IG Business ID as the 'pageId' to our backend
            // But we keep track of which FB page was selected for UI
            setSelectedPageToken(page.access_token);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de que quieres desconectar Instagram? Dejarás de recibir mensajes.')) return;

        setIsDisconnecting(true);
        try {
            const { disconnectInstagram } = await import('./actions');
            await disconnectInstagram();
            setPages([]);
            setSelectedPageId('');
            setSelectedPageToken('');
            setUserAccessToken(null);
        } catch (error) {
            alert('Error al desconectar.');
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const { testInstagramConnection } = await import('./actions');
            const result = await testInstagramConnection();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to run test.' });
        } finally {
            setIsTesting(false);
        }
    };

    // Derived state for the hidden input
    const selectedPage = pages.find(p => p.id === selectedPageId);
    const submissionPageId = selectedPage?.instagram_business_account?.id || selectedPageId;

    if (isConnected) {
        return (
            <Card className="border-pink-200 bg-pink-50 dark:bg-pink-950/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Instagram className="h-6 w-6 text-pink-600" />
                        <CardTitle className="text-pink-700">Instagram Configurado</CardTitle>
                    </div>
                    <CardDescription>
                        Tu cuenta de Instagram Business está conectada y lista.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-1">
                        <Label className="text-xs text-muted-foreground">ID Conectado</Label>
                        <p className="font-mono text-sm">{initialPageId}</p>
                    </div>

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
                <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <CardTitle>Conexión de Instagram DM</CardTitle>
                </div>
                <CardDescription>
                    Conecta tu cuenta Professional de Instagram (vía Facebook Page) para recibir DMs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!userAccessToken ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        {!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
                            <div className="w-full text-center p-2 text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded mb-2">
                                ⚠️ Falta NEXT_PUBLIC_FACEBOOK_APP_ID en .env
                            </div>
                        )}
                        <Button
                            type="button"
                            onClick={handleLogin}
                            disabled={!sdkLoaded}
                            className="bg-[#1877F2] hover:bg-[#1864D9] text-white flex items-center gap-2 text-base h-12 px-6 shadow-sm"
                        >
                            <Facebook className="h-5 w-5" />
                            Continuar con Facebook
                        </Button>
                        <p className="text-xs text-muted-foreground text-center max-w-sm">
                            Se abrirá una ventana emergente para que autorices a Varylo a gestionar tus mensajes de Instagram.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100 text-sm mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Sesión iniciada con Facebook</span>
                        </div>

                        {isLoadingPages ? (
                            <div className="text-center text-sm text-muted-foreground py-4">Cargando tus páginas...</div>
                        ) : (
                            <div className="space-y-4">
                                <form action={saveAction} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Selecciona tu Página de Facebook</Label>
                                        <Select value={selectedPageId} onValueChange={handlePageSelection} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una página..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pages.map((page) => (
                                                    <SelectItem key={page.id} value={page.id}>
                                                        {page.name} {page.instagram_business_account ? '(Instagram conectado)' : '(Sin Instagram)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Selecciona la página vinculada a tu cuenta de Instagram Business.
                                        </p>
                                    </div>

                                    {/* Hidden Inputs for Server Action (The magic happens here) */}
                                    {/* We save the IG Business ID as the pageId because that's what our backend needs */}
                                    <input type="hidden" name="pageId" value={submissionPageId} />
                                    <input type="hidden" name="accessToken" value={selectedPageToken} />

                                    {isError && (
                                        <div className="flex items-center gap-2 text-sm text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            {state}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isSaving || !selectedPageId || !selectedPageToken}
                                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                    >
                                        {isSaving ? 'Guardando configuración...' : 'Confirmar y Guardar'}
                                    </Button>
                                </form>
                                <div className="text-center">
                                    <Button variant="ghost" size="sm" onClick={() => { setUserAccessToken(null); setPages([]); }} className="text-muted-foreground">
                                        Cancelar y cambiar cuenta
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
