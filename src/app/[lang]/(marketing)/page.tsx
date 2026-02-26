import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check, MessageSquare, Bot, Workflow, Users, BarChart3, Sparkles, ArrowRight, Star, Zap, AlertTriangle, EyeOff, Moon } from 'lucide-react';
import { ContactForm } from './contact-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function LandingPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const d = dict.landing;

    return (
        <div className="flex flex-col bg-black text-white">

            {/* Hero */}
            <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[128px] animate-pulse [animation-delay:1s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[128px]" />
                </div>
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

                <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-sm text-blue-400 font-medium mb-8">
                        <Zap className="h-3.5 w-3.5" />
                        {d.hero.badge}
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                        <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                            {d.hero.title}
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                        {d.hero.description}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href={`/${lang}/register`}>
                            <Button size="lg" className="h-14 px-10 text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-blue-600/25 w-full sm:w-auto gap-2">
                                {d.hero.ctaPrimary}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-base border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto backdrop-blur-sm">
                                {d.hero.ctaSecondary}
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-20 flex flex-col items-center gap-4">
                        <p className="text-xs text-zinc-600 uppercase tracking-[0.2em] font-medium">{d.hero.socialProof}</p>
                        <div className="flex items-center gap-8 text-zinc-600">
                            <span className="text-lg font-bold tracking-tight">TechStore</span>
                            <span className="text-lg font-bold tracking-tight">FastDelivery</span>
                            <span className="hidden sm:block text-lg font-bold tracking-tight">BeautyBox</span>
                            <span className="hidden md:block text-lg font-bold tracking-tight">CloudShop</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems */}
            <section className="py-32 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.problems.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg">{d.problems.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            { icon: AlertTriangle, ...d.problems.p1, color: 'red' },
                            { icon: EyeOff, ...d.problems.p2, color: 'orange' },
                            { icon: Moon, ...d.problems.p3, color: 'amber' },
                        ].map((p, i) => (
                            <div key={i} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 hover:border-red-500/20 transition-all duration-500">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                                        <p.icon className="h-6 w-6 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.solution.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg max-w-2xl mx-auto">{d.solution.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {Object.values(d.solution.metrics).map((m: any, i: number) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl sm:text-6xl font-black bg-gradient-to-b from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                    {m.value}
                                </div>
                                <p className="text-zinc-500 mt-3 text-sm">{m.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.features.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg">{d.features.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            { icon: MessageSquare, ...d.features.omnichannel, color: 'blue', isNew: false },
                            { icon: Bot, ...d.features.aiAgents, color: 'violet', isNew: true },
                            { icon: Workflow, ...d.features.chatbots, color: 'emerald', isNew: true },
                            { icon: Users, ...d.features.agents, color: 'orange', isNew: false },
                            { icon: BarChart3, ...d.features.analytics, color: 'cyan', isNew: false },
                            { icon: Sparkles, ...d.features.ai, color: 'pink', isNew: false },
                        ].map((f, i) => {
                            const colorMap: Record<string, string> = {
                                blue: 'from-blue-500/20 to-blue-500/0 text-blue-400 bg-blue-500/10',
                                violet: 'from-violet-500/20 to-violet-500/0 text-violet-400 bg-violet-500/10',
                                emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400 bg-emerald-500/10',
                                orange: 'from-orange-500/20 to-orange-500/0 text-orange-400 bg-orange-500/10',
                                cyan: 'from-cyan-500/20 to-cyan-500/0 text-cyan-400 bg-cyan-500/10',
                                pink: 'from-pink-500/20 to-pink-500/0 text-pink-400 bg-pink-500/10',
                            };
                            const c = colorMap[f.color] || colorMap.blue;
                            const [gradFrom, , iconColor, iconBg] = c.split(' ');
                            return (
                                <div key={i} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 hover:border-white/10 transition-all duration-500 overflow-hidden">
                                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradFrom}`} />
                                    {f.isNew && (
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">New</span>
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-6`}>
                                        <f.icon className={`h-6 w-6 ${iconColor}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how" className="py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.how.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg">{d.how.subtitle}</p>
                    </div>
                    <div className="max-w-4xl mx-auto relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-blue-600/50 via-violet-600/50 to-blue-600/50" />
                        <div className="grid md:grid-cols-3 gap-16">
                            {[d.how.step1, d.how.step2, d.how.step3].map((step: any, i: number) => (
                                <div key={i} className="text-center relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-8 font-bold text-3xl text-white shadow-lg shadow-blue-600/20 relative z-10">
                                        {i + 1}
                                    </div>
                                    <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl sm:text-5xl font-bold text-center mb-20 tracking-tight">{d.testimonials.title}</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[d.testimonials.t1, d.testimonials.t2, d.testimonials.t3].map((t: any, i: number) => (
                            <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed mb-8">&ldquo;{t.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                        {t.author.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{t.author}</p>
                                        <p className="text-zinc-500 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.pricing.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg">{d.pricing.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
                        {/* Starter */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8">
                            <h3 className="text-lg font-semibold">{d.pricing.starter.title}</h3>
                            <div className="flex items-baseline gap-1 mt-4 mb-2">
                                <span className="text-5xl font-black">$29</span>
                                <span className="text-zinc-500">/mes</span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-8">{d.pricing.starter.description}</p>
                            <Link href={`/${lang}/register?plan=STARTER`} className="block">
                                <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                                    {d.pricing.cta}
                                </Button>
                            </Link>
                            <ul className="space-y-3 mt-8">
                                {d.pricing.starter.features.map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Pro */}
                        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-600/10 to-transparent backdrop-blur-sm p-8 relative lg:scale-105 shadow-lg shadow-blue-600/10">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Popular</div>
                            <h3 className="text-lg font-semibold">{d.pricing.pro.title}</h3>
                            <div className="flex items-baseline gap-1 mt-4 mb-2">
                                <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">$79</span>
                                <span className="text-zinc-500">/mes</span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-8">{d.pricing.pro.description}</p>
                            <Link href={`/${lang}/register?plan=PRO`} className="block">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-blue-600/25">
                                    {d.pricing.cta}
                                </Button>
                            </Link>
                            <ul className="space-y-3 mt-8">
                                {d.pricing.pro.features.map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Scale */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8">
                            <h3 className="text-lg font-semibold">{d.pricing.scale.title}</h3>
                            <div className="flex items-baseline gap-1 mt-4 mb-2">
                                <span className="text-5xl font-black">$199</span>
                                <span className="text-zinc-500">/mes</span>
                            </div>
                            <p className="text-zinc-500 text-sm mb-8">{d.pricing.scale.description}</p>
                            <Link href="#contact" className="block">
                                <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                                    {d.pricing.ctaCustom}
                                </Button>
                            </Link>
                            <ul className="space-y-3 mt-8">
                                {d.pricing.scale.features.map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-32">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl sm:text-5xl font-bold text-center mb-20 tracking-tight">{d.faq.title}</h2>
                    <div className="space-y-4">
                        {[d.faq.q1, d.faq.q2, d.faq.q3, d.faq.q4, d.faq.q5].map((q: any, i: number) => (
                            <div key={i} className="border border-white/5 rounded-2xl p-6 bg-white/[0.02]">
                                <h3 className="font-semibold">{q.question}</h3>
                                <p className="text-zinc-500 mt-3 text-sm leading-relaxed">{q.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[128px]" />
                </div>
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent mb-6">
                            {d.cta.title}
                        </h2>
                        <p className="text-zinc-400 text-lg mb-10">{d.cta.subtitle}</p>
                        <Link href={`/${lang}/register`}>
                            <Button size="lg" className="h-14 px-10 text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-blue-600/25 gap-2">
                                {d.cta.button}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="py-32 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{d.contact.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg">{d.contact.subtitle}</p>
                    </div>
                    <ContactForm dict={d.contact.form} />
                </div>
            </section>
        </div>
    );
}
