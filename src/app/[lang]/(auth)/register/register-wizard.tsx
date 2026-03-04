'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { register } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2 } from 'lucide-react';

type AvailablePlan = {
    id: string;
    slug: string;
    name: string;
    priceInCents: number;
    trialDays: number;
};

type Props = {
    dict: any;
    lang: string;
    availablePlans: AvailablePlan[];
    defaultPlanSlug?: string;
};

export function RegisterWizard({ dict, lang, availablePlans, defaultPlanSlug = 'STARTER' }: Props) {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPlanSlug, setSelectedPlanSlug] = useState(defaultPlanSlug);

    const stepLabels = [dict.steps.account, dict.steps.ready];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        formData.set('plan', selectedPlanSlug);

        const result = await register(undefined, formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // Account created — sign in client-side
        const emailVal = formData.get('email') as string;
        const passwordVal = formData.get('password') as string;

        const signInResult = await signIn('credentials', {
            email: emailVal,
            password: passwordVal,
            redirect: false,
        });

        if (signInResult?.error) {
            setError(dict.errors.signInFailed);
            setLoading(false);
            return;
        }

        setStep(2);
        setLoading(false);
    }

    // ─── Progress bar ─────────────────────────────
    function ProgressBar() {
        return (
            <div className="flex items-center gap-2 mb-8">
                {stepLabels.map((label, i) => {
                    const stepNum = i + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    return (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2 flex-1">
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        isCompleted || isActive
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
                                </div>
                                <span
                                    className={`text-sm hidden sm:inline ${
                                        isActive || isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400'
                                    }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < stepLabels.length - 1 && (
                                <div className={`h-px flex-1 ${step > stepNum ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ─── Step 1: Account + Plan ───────────────────
    if (step === 1) {
        return (
            <div>
                <ProgressBar />
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">{dict.step1.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{dict.step1.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-gray-700 text-sm">{dict.companyNameLabel}</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                placeholder={dict.companyNamePlaceholder}
                                required
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 text-sm">{dict.nameLabel}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={dict.namePlaceholder}
                                required
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 text-sm">{dict.emailLabel}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 text-sm">{dict.passwordLabel}</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 text-sm">{dict.confirmPasswordLabel}</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={8}
                                className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    {/* Plan selector */}
                    {availablePlans.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-gray-700 text-sm">{dict.planLabel}</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {availablePlans.map((p) => (
                                    <label
                                        key={p.id}
                                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                                            selectedPlanSlug === p.slug
                                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="planRadio"
                                                value={p.slug}
                                                checked={selectedPlanSlug === p.slug}
                                                onChange={() => setSelectedPlanSlug(p.slug)}
                                                className="accent-emerald-600"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{p.name}</span>
                                            {p.trialDays > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    {p.trialDays} días gratis
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            ${(p.priceInCents / 100).toLocaleString('es-CO')} <span className="text-gray-400">COP/mes</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {dict.submitButtonPending}
                            </>
                        ) : (
                            dict.submitButton
                        )}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        {dict.hasAccount}{' '}
                        <Link href={`/${lang}/login`} className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                            {dict.login}
                        </Link>
                    </p>
                </form>
            </div>
        );
    }

    // ─── Step 2: Success ──────────────────────────
    return (
        <div>
            <ProgressBar />
            <div className="text-center space-y-6 py-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{dict.step3.title}</h2>
                    <p className="mt-2 text-gray-500">
                        {(() => {
                            const selected = availablePlans.find((p) => p.slug === selectedPlanSlug);
                            const days = selected?.trialDays || 0;
                            return days > 0
                                ? dict.step3.subtitle.replace('{days}', String(days))
                                : dict.step3.description;
                        })()}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">{dict.step3.description}</p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8">
                    <Link href={`/${lang}/dashboard`}>{dict.step3.goToDashboard}</Link>
                </Button>
            </div>
        </div>
    );
}
