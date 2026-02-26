import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { WhatsAppConnectionForm } from "./whatsapp-form"
import { OpenAIKeyForm } from "./openai-form"
import { CreditBalanceCard } from "./credit-balance-card"
import { Instagram } from "lucide-react"

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ChannelType } from '@prisma/client';

export default async function SettingsPage() {
    const session = await auth();
    const companyId = session?.user?.companyId;

    let whatsappConfig = null;
    let whatsappChannelId: string | null = null;
    let whatsappAutomationPriority: string = 'CHATBOT_FIRST';
    let hasOpenAIKey = false;
    let openaiKeyUpdatedAt: string | null = null;
    let companyName = '';
    let creditBalance = 0;
    let userEmail = session?.user?.email || '';

    if (companyId) {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true, openaiApiKey: true, openaiApiKeyUpdatedAt: true, creditBalance: true },
        });
        companyName = company?.name || '';
        hasOpenAIKey = !!company?.openaiApiKey;
        openaiKeyUpdatedAt = company?.openaiApiKeyUpdatedAt?.toISOString() || null;
        creditBalance = company?.creditBalance || 0;

        const whatsappChannel = await prisma.channel.findFirst({
            where: {
                companyId,
                type: ChannelType.WHATSAPP,
            },
        });

        if (whatsappChannel) {
            whatsappChannelId = whatsappChannel.id;
            whatsappAutomationPriority = whatsappChannel.automationPriority;
            if (whatsappChannel.configJson) {
                whatsappConfig = whatsappChannel.configJson as {
                    phoneNumberId?: string;
                    verifyToken?: string;
                    accessToken?: string
                };
            }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">Configuración</h3>
                <p className="text-sm text-muted-foreground">
                    Administra la configuración general de tu cuenta y empresa.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                {/* Company Profile */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Perfil de Empresa</CardTitle>
                                <CardDescription>
                                    Información visible para tus clientes.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">Próximamente</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nombre de Empresa</Label>
                            <Input id="companyName" defaultValue={companyName} disabled className="bg-muted/50" />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Notificaciones</CardTitle>
                                <CardDescription>
                                    Configura cómo quieres recibir alertas.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">Próximamente</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 opacity-60 pointer-events-none">
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

                {/* Credit Balance */}
                <CreditBalanceCard
                    balance={creditBalance}
                    hasOwnKey={hasOpenAIKey}
                    companyId={companyId || ''}
                    companyEmail={userEmail}
                />

                {/* Integrations */}
                <Separator />
                <div>
                    <h4 className="text-base font-medium mb-1">Integraciones</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Conecta tus canales de comunicación y servicios externos.
                    </p>
                </div>

                <WhatsAppConnectionForm
                    initialPhoneNumberId={whatsappConfig?.phoneNumberId}
                    initialVerifyToken={whatsappConfig?.verifyToken}
                    hasAccessToken={!!whatsappConfig?.accessToken}
                    channelId={whatsappChannelId}
                    automationPriority={whatsappAutomationPriority}
                />

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Instagram className="h-5 w-5 text-pink-600" />
                                <CardTitle>Instagram DM</CardTitle>
                            </div>
                            <Badge variant="secondary">Próximamente</Badge>
                        </div>
                        <CardDescription>
                            Conecta tu cuenta de Instagram para recibir DMs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="opacity-50 pointer-events-none">
                        <p className="text-center py-6 text-sm text-muted-foreground">
                            Esta integración estará disponible próximamente.
                        </p>
                    </CardContent>
                </Card>

                <OpenAIKeyForm
                    hasApiKey={hasOpenAIKey}
                    updatedAt={openaiKeyUpdatedAt}
                />
            </div>
        </div>
    );
}
