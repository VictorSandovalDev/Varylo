import { MarketingHeader } from '@/components/marketing-header';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function MarketingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang as Locale);
    const nav = dict.nav;

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
            <MarketingHeader lang={lang} nav={nav} />
            <main className="flex-1">{children}</main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        {dict.footer.rights}
                    </p>
                </div>
            </footer>
        </div>
    );
}
