import { Sidebar, companyAdminItems } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Locale } from '@/lib/dictionary';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function CompanyLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const session = await auth();

    let tags: any[] = [];
    if (session?.user?.companyId) {
        try {
            tags = await prisma.tag.findMany({
                where: {
                    companyId: session.user.companyId,
                    showInSidebar: true
                },
                orderBy: { name: 'asc' }
            });
        } catch (e) {
            console.error("Failed to fetch tags for sidebar", e);
        }
    }

    return (
        <div className="grid w-full min-h-screen lg:grid-cols-[240px_1fr]">
            <Sidebar role="company" lang={lang} tags={tags} />
            <div className="flex flex-col">
                <DashboardHeader title="Company Dashboard" />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
