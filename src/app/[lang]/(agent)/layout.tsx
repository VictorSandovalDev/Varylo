import { Sidebar, agentItems } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Locale } from '@/lib/dictionary';

export default async function AgentLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
            <Sidebar role="agent" lang={lang} />
            <div className="flex flex-col">
                <DashboardHeader title="Agent Inbox" />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
