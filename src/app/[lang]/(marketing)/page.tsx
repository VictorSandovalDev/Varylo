import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Check, MessageSquare, Bot, Workflow, Users, BarChart3, Sparkles, ArrowRight, Star, Zap, AlertTriangle, EyeOff, Moon } from 'lucide-react';
import { ContactForm } from './contact-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function LandingPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const d = dict.landing;

    return (
        <div className="flex flex-col">

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="container mx-auto text-center pt-24 pb-24 px-4 relative">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium">
                            <Zap className="h-3.5 w-3.5" />
                            {d.hero.badge}
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.1]">
                            {d.hero.title}
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {d.hero.description}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <Link href={`/${lang}/register`}>
                                <Button size="lg" className="h-13 px-8 text-base w-full sm:w-auto gap-2">
                                    {d.hero.ctaPrimary}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button size="lg" variant="outline" className="h-13 px-8 text-base w-full sm:w-auto">
                                    {d.hero.ctaSecondary}
                                </Button>
                            </Link>
                        </div>
                        {/* Social proof */}
                        <div className="pt-12 flex flex-col items-center gap-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{d.hero.socialProof}</p>
                            <div className="flex items-center gap-8 opacity-40">
                                <span className="text-xl font-bold tracking-tight">TechStore</span>
                                <span className="text-xl font-bold tracking-tight">FastDelivery</span>
                                <span className="hidden sm:block text-xl font-bold tracking-tight">BeautyBox</span>
                                <span className="hidden md:block text-xl font-bold tracking-tight">CloudShop</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.problems.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg">{d.problems.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle className="text-lg">{d.problems.p1.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.problems.p1.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                                    <EyeOff className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle className="text-lg">{d.problems.p2.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.problems.p2.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-destructive/20 bg-destructive/5 shadow-none">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
                                    <Moon className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle className="text-lg">{d.problems.p3.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.problems.p3.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Solution / Metrics Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.solution.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">{d.solution.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {Object.values(d.solution.metrics).map((m: any, i: number) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl sm:text-5xl font-extrabold text-primary">{m.value}</div>
                                <p className="text-sm text-muted-foreground mt-2">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.features.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg">{d.features.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                                    <MessageSquare className="h-6 w-6 text-blue-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.omnichannel.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.omnichannel.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30 relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-2">
                                    <Bot className="h-6 w-6 text-violet-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.aiAgents.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.aiAgents.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30 relative overflow-hidden">
                            <div className="absolute top-3 right-3">
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2">
                                    <Workflow className="h-6 w-6 text-emerald-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.chatbots.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.chatbots.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                                    <Users className="h-6 w-6 text-orange-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.agents.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.agents.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2">
                                    <BarChart3 className="h-6 w-6 text-cyan-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.analytics.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.analytics.description}</p>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-2">
                                    <Sparkles className="h-6 w-6 text-pink-500" />
                                </div>
                                <CardTitle className="text-lg">{d.features.ai.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">{d.features.ai.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how" className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.how.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg">{d.how.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg shadow-primary/25">1</div>
                            <h3 className="font-bold text-lg mb-2">{d.how.step1.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{d.how.step1.description}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg shadow-primary/25">2</div>
                            <h3 className="font-bold text-lg mb-2">{d.how.step2.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{d.how.step2.description}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 font-bold text-2xl shadow-lg shadow-primary/25">3</div>
                            <h3 className="font-bold text-lg mb-2">{d.how.step3.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{d.how.step3.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">{d.testimonials.title}</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[d.testimonials.t1, d.testimonials.t2, d.testimonials.t3].map((t: any, i: number) => (
                            <Card key={i} className="shadow-none">
                                <CardContent className="pt-6">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {t.author.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{t.author}</p>
                                            <p className="text-muted-foreground text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.pricing.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg">{d.pricing.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                        {/* Starter */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{d.pricing.starter.title}</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-extrabold">$29</span>
                                    <span className="text-muted-foreground">/mes</span>
                                </div>
                                <CardDescription className="mt-2">{d.pricing.starter.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {d.pricing.starter.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/${lang}/register?plan=STARTER`} className="w-full">
                                    <Button className="w-full" variant="outline">{d.pricing.cta}</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        {/* Pro */}
                        <Card className="border-primary shadow-lg relative lg:scale-105">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Popular</div>
                            <CardHeader>
                                <CardTitle>{d.pricing.pro.title}</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-extrabold">$79</span>
                                    <span className="text-muted-foreground">/mes</span>
                                </div>
                                <CardDescription className="mt-2">{d.pricing.pro.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {d.pricing.pro.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/${lang}/register?plan=PRO`} className="w-full">
                                    <Button className="w-full">{d.pricing.cta}</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        {/* Scale */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{d.pricing.scale.title}</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-extrabold">$199</span>
                                    <span className="text-muted-foreground">/mes</span>
                                </div>
                                <CardDescription className="mt-2">{d.pricing.scale.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {d.pricing.scale.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href="#contact" className="w-full">
                                    <Button className="w-full" variant="outline">{d.pricing.ctaCustom}</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-muted/30">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">{d.faq.title}</h2>
                    <div className="space-y-4">
                        {[d.faq.q1, d.faq.q2, d.faq.q3, d.faq.q4, d.faq.q5].map((q: any, i: number) => (
                            <div key={i} className="border rounded-xl p-5 bg-background">
                                <h3 className="font-semibold">{q.question}</h3>
                                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{q.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 sm:p-16 text-primary-foreground">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.cta.title}</h2>
                        <p className="mt-4 text-primary-foreground/80 text-lg">{d.cta.subtitle}</p>
                        <Link href={`/${lang}/register`}>
                            <Button size="lg" variant="secondary" className="mt-8 h-13 px-8 text-base gap-2">
                                {d.cta.button}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold">{d.contact.title}</h2>
                        <p className="text-muted-foreground mt-3 text-lg">{d.contact.subtitle}</p>
                    </div>
                    <ContactForm dict={d.contact.form} />
                </div>
            </section>

        </div>
    );
}
