'use client';

import { useActionState } from 'react';
import { saveWhatsAppCredentials } from './actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function WhatsAppConnectionForm() {
    const [state, action, isPending] = useActionState(saveWhatsAppCredentials, undefined);

    const isSuccess = state?.startsWith('Success');
    const isError = state?.startsWith('Error');

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
                            required
                        />
                    </div>

                    {isError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            {state}
                        </div>
                    )}
                    {isSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            {state}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Conectar WhatsApp'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
