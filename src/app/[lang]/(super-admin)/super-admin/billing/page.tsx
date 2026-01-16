import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Check } from "lucide-react"

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Planes y Facturación</h3>
                <p className="text-sm text-muted-foreground">
                    Gestiona los planes disponibles para las empresas.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Starter</CardTitle>
                        <CardDescription>Para startups y pequeños negocios.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/mes</span></div>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> 1 Agente</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> 1000 Mensajes/mes</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> WhatsApp Básico</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Editar Plan</Button>
                    </CardFooter>
                </Card>

                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Pro</CardTitle>
                                <CardDescription>Para equipos en crecimiento.</CardDescription>
                            </div>
                            <Badge>Popular</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$79<span className="text-lg font-normal text-muted-foreground">/mes</span></div>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> 5 Agentes</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Mensajes Ilimitados</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Automatizaciones</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Reportes Avanzados</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Editar Plan</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Scale</CardTitle>
                        <CardDescription>Para grandes organizaciones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$199<span className="text-lg font-normal text-muted-foreground">/mes</span></div>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Agentes Ilimitados</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> API Access</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Soporte 24/7</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Whitelabel</li>
                            <li className="flex items-center text-sm"><Check className="mr-2 h-4 w-4 text-green-500" /> Onboarding Dedicado</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Editar Plan</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
