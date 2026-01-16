import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ContactForm } from './contact-form';
import { getDictionary, Locale } from '@/lib/dictionary';

const PricingCard = ({ title, price, features, recommended = false, cta }: { title: string, price: string, features: string[], recommended?: boolean, cta: string }) => (
    <Card className={`relative ${recommended ? 'border-primary shadow-lg scale-105' : ''}`}>
        {recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">Popular</span>}
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-2xl font-bold">{price}</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" /> {feature}
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter>
            <Link href={`/register?plan=${title.toUpperCase()}`} className="w-full">
                <Button className="w-full" variant={recommended ? 'default' : 'outline'}>{cta}</Button>
            </Link>
        </CardFooter>
    </Card>
);

const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
    <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {icon}
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default async function LandingPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const d = dict.landing;

    return (
        <div className="flex flex-col gap-24 py-10">

            {/* Hero Section */}
            <section id="hero" className="container mx-auto text-center pt-20 pb-20">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                        {d.hero.badge}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {d.hero.title}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {d.hero.description}
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link href={`/${lang}/register`}>
                            <Button size="lg" className="h-12 px-8 text-lg">{d.hero.ctaPrimary}</Button>
                        </Link>
                        <Link href="#how">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">{d.hero.ctaSecondary}</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{d.features.title}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        title={d.features.omnichannel.title}
                        description={d.features.omnichannel.description}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 4.863 4.863 0 0 0-.8-.048m9.229 0c.465 0 .9.096 1.313.265M15.06 1.125Q16.371 1.247 17.622 1.54m-8.1 4.57c.94-.963 2.19-1.576 3.577-1.576.435 0 .86.06 1.266.172m-13.784 7.64q.18-.75.463-1.46M5.501 5.3a17.214 17.214 0 0 1 3.522-.962m0 0q.412-.057.828-.087m-4.35 1.05A12.022 12.022 0 0 0 .5 10.5a12.025 12.025 0 0 0 4.5 9.172v3.085l3-3c.48.06.966.104 1.456.13a6.12 6.12 0 0 1 .491-1.879m0 0a6.118 6.118 0 0 1 1.637-2.671m0 0c.439-.44.93-.823 1.439-1.137" /></svg>}
                    />
                    <FeatureCard
                        title={d.features.agents.title}
                        description={d.features.agents.description}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
                    />
                    <FeatureCard
                        title={d.features.ai.title}
                        description={d.features.ai.description}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>}
                    />
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how" className="container mx-auto bg-zinc-50 dark:bg-zinc-900 py-20 rounded-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">{d.how.title}</h2>
                    <p className="text-muted-foreground mt-2">{d.how.subtitle}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                        <h3 className="font-bold text-lg">{d.how.step1.title}</h3>
                        <p className="text-muted-foreground">{d.how.step1.description}</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                        <h3 className="font-bold text-lg">{d.how.step2.title}</h3>
                        <p className="text-muted-foreground">{d.how.step2.description}</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                        <h3 className="font-bold text-lg">{d.how.step3.title}</h3>
                        <p className="text-muted-foreground">{d.how.step3.description}</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{d.pricing.title}</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <PricingCard
                        title={d.pricing.starter.title}
                        price="$29/mo"
                        features={d.pricing.starter.features}
                        cta={d.pricing.cta}
                    />
                    <PricingCard
                        title={d.pricing.pro.title}
                        price="$79/mo"
                        recommended
                        features={d.pricing.pro.features}
                        cta={d.pricing.cta}
                    />
                    <PricingCard
                        title={d.pricing.scale.title}
                        price="$199/mo"
                        features={d.pricing.scale.features}
                        cta={d.pricing.cta}
                    />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-12">{d.faq.title}</h2>
                <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium">{d.faq.q1.question}</h3>
                        <p className="text-muted-foreground mt-2 text-sm">{d.faq.q1.answer}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium">{d.faq.q2.question}</h3>
                        <p className="text-muted-foreground mt-2 text-sm">{d.faq.q2.answer}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium">{d.faq.q3.question}</h3>
                        <p className="text-muted-foreground mt-2 text-sm">{d.faq.q3.answer}</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="container mx-auto py-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-center">
                <h2 className="text-3xl font-bold mb-6">{d.contact.title}</h2>
                <p className="text-muted-foreground mb-8">{d.contact.subtitle}</p>
                <ContactForm dict={d.contact.form} />
            </section>

        </div>
    );
}
