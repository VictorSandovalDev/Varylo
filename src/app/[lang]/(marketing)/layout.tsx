import { MarketingHeader } from '@/components/marketing-header';
import { getDictionary, Locale } from '@/lib/dictionary';
import { getSiteConfig } from '@/lib/site-config';
import Link from 'next/link';
import Image from 'next/image';

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
    const siteConfig = await getSiteConfig();

    return (
        <div className="flex min-h-screen flex-col">
            <MarketingHeader lang={lang} nav={nav} />
            <main className="flex-1 pt-16">{children}</main>
            <footer className="bg-gray-900 text-white border-t border-gray-800">
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4">
                                <Image src="/logo.png" alt="Varylo" width={140} height={79} className="brightness-0 invert" />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {lang === 'es'
                                    ? 'La plataforma que unifica tu atención al cliente con IA.'
                                    : 'The platform that unifies your customer support with AI.'}
                            </p>
                        </div>
                        {siteConfig.footerSections.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="font-semibold text-sm text-gray-300 mb-4">{section.title}</h4>
                                <ul className="space-y-2.5 text-sm text-gray-400">
                                    {section.links.map((link, lIdx) => {
                                        const href = link.href.startsWith('/')
                                            ? `/${lang}${link.href}`
                                            : link.href;
                                        return (
                                            <li key={lIdx}>
                                                <Link href={href} className="hover:text-emerald-400 transition-colors">
                                                    {link.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8">
                        <p className="text-center text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} {siteConfig.copyrightText}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
