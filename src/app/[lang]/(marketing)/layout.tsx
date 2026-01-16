import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDictionary, Locale } from '@/lib/dictionary';
import { LanguageSwitcher } from '@/components/language-switcher';

export default async function MarketingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const nav = dict.nav;

    // Helper to generate localized paths
    // e.g. /es/login
    // But Link href can be just /login if we handle prefix??
    // No, Link needs full path or we use a wrapper.
    // For now, hardcode `${lang}/...`

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
                    <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                        <span className="font-bold text-xl sm:inline-block">
                            VARYLO
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href={`/${lang}/#hero`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.home}</Link>
                        <Link href={`/${lang}/#features`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.features}</Link>
                        <Link href={`/${lang}/#pricing`} className="transition-colors hover:text-foreground/80 text-foreground/60">{nav.pricing}</Link>
                    </nav>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <LanguageSwitcher />
                        <nav className="flex items-center space-x-2">
                            <Link href={`/${lang}/login`}>
                                <Button variant="ghost" size="sm">{nav.login}</Button>
                            </Link>
                            <Link href={`/${lang}/register`}>
                                <Button size="sm">{nav.getStarted}</Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>
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
