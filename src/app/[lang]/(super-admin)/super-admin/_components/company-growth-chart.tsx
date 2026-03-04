'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CompanyGrowthChartProps {
    data: { month: string; count: number }[];
}

export function CompanyGrowthChart({ data }: CompanyGrowthChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                Sin datos de crecimiento
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                    formatter={(value) => [value as number, 'Nuevas empresas']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
