import { MarketingHeader } from '@/components/marketing-header';
import { getDictionary, Locale } from '@/lib/dictionary';
import Link from 'next/link';

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
    const footer = dict.footer;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MarketingHeader lang={lang} nav={nav} />
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <span className="font-bold text-xl">VARYLO</span>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                {lang === 'es'
                                    ? 'La plataforma que unifica tu atención al cliente con IA.'
                                    : 'The platform that unifies your customer support with AI.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-3">{footer.product}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#features" className="hover:text-foreground transition-colors">{nav.features}</Link></li>
                                <li><Link href="#pricing" className="hover:text-foreground transition-colors">{nav.pricing}</Link></li>
                                <li><Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-3">{footer.company}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#contact" className="hover:text-foreground transition-colors">{footer.about}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-3">{footer.legal}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground transition-colors">{footer.privacy}</Link></li>
                                <li><Link href="#" className="hover:text-foreground transition-colors">{footer.terms}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-8">
                        <p className="text-center text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} {footer.rights}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
