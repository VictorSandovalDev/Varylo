import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { WhatsAppConnectionForm } from "./whatsapp-form"

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChannelType } from '@prisma/client';

export default async function SettingsPage() {
    const session = await auth();
    const companyId = session?.user?.companyId;

    let whatsappConfig = null;

    if (companyId) {
        const channel = await prisma.channel.findFirst({
            where: {
                companyId,
                type: ChannelType.WHATSAPP,
            },
        });
        if (channel?.configJson) {
            whatsappConfig = channel.configJson as {
                phoneNumberId?: string;
                verifyToken?: string;
                accessToken?: string
            };
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Configuración</h3>
                <p className="text-sm text-muted-foreground">
                    Administra la configuración general de tu cuenta y empresa.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil de Empresa</CardTitle>
                        <CardDescription>
                            Información visible para tus clientes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nombre de Empresa</Label>
                            <Input id="companyName" defaultValue="Acme Inc" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Sitio Web</Label>
                            <Input id="website" defaultValue="https://acme.com" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Guardar Cambios</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notificaciones</CardTitle>
                        <CardDescription>
                            Configura cómo quieres recibir alertas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                                <span>Notificaciones por Email</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Recibe resúmenes semanales de actividad.
                                </span>
                            </Label>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="desktop-notifications" className="flex flex-col space-y-1">
                                <span>Notificaciones de Escritorio</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Alertas en tiempo real para nuevos mensajes.
                                </span>
                            </Label>
                            <Switch id="desktop-notifications" />
                        </div>
                    </CardContent>
                </Card>

                <WhatsAppConnectionForm
                    initialPhoneNumberId={whatsappConfig?.phoneNumberId}
                    initialVerifyToken={whatsappConfig?.verifyToken}
                    hasAccessToken={!!whatsappConfig?.accessToken}
                />
            </div>
        </div>
    );
}
