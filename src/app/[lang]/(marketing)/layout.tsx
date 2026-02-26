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
        <div className="flex min-h-screen flex-col bg-black text-white">
            <MarketingHeader lang={lang} nav={nav} />
            <main className="flex-1 pt-16">{children}</main>
            <footer className="border-t border-white/5 bg-zinc-950">
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs">V</div>
                                <span className="font-bold text-lg text-white">VARYLO</span>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                {lang === 'es'
                                    ? 'La plataforma que unifica tu atención al cliente con IA.'
                                    : 'The platform that unifies your customer support with AI.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-300 mb-4">{footer.product}</h4>
                            <ul className="space-y-2.5 text-sm text-zinc-500">
                                <li><Link href="#features" className="hover:text-white transition-colors">{nav.features}</Link></li>
                                <li><Link href="#pricing" className="hover:text-white transition-colors">{nav.pricing}</Link></li>
                                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-300 mb-4">{footer.company}</h4>
                            <ul className="space-y-2.5 text-sm text-zinc-500">
                                <li><Link href="#contact" className="hover:text-white transition-colors">{footer.about}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-zinc-300 mb-4">{footer.legal}</h4>
                            <ul className="space-y-2.5 text-sm text-zinc-500">
                                <li><Link href="#" className="hover:text-white transition-colors">{footer.privacy}</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">{footer.terms}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 mt-12 pt-8">
                        <p className="text-center text-sm text-zinc-600">
                            &copy; {new Date().getFullYear()} {footer.rights}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
