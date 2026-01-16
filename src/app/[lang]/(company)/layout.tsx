import { Sidebar, companyAdminItems } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Locale } from '@/lib/dictionary';

export default async function CompanyLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    return (
        // Force recompile
        <div className="grid w-full min-h-screen lg:grid-cols-[240px_1fr]">
            <Sidebar items={companyAdminItems} lang={lang} />
            <div className="flex flex-col">
                <DashboardHeader title="Company Dashboard" />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
