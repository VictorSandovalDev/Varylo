import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Check } from "lucide-react"
import { getLandingPlans } from "./actions"
import { PlanManager } from "./plan-manager"

export default async function BillingPage() {
    const plans = await getLandingPlans();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Planes y Facturación</h3>
                <p className="text-sm text-muted-foreground">
                    Gestiona los planes que se muestran en la landing page. Los cambios se reflejan de inmediato.
                </p>
            </div>

            <PlanManager initialPlans={plans} />
        </div>
    );
}
