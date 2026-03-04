import Link from 'next/link';
import RegisterForm from './register-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function RegisterPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ plan?: string }>;
}) {
    const { lang } = await params;
    const { plan } = await searchParams;
    const dict = await getDictionary(lang);
    const d = dict.auth.register;

    const validPlans = ['STARTER', 'PRO', 'SCALE'];
    const selectedPlan = plan && validPlans.includes(plan.toUpperCase()) ? plan.toUpperCase() : 'STARTER';

    return (
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
            <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-white">{d.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    {d.subtitle}
                </p>
            </div>
            <RegisterForm dict={d} defaultPlan={selectedPlan} />
            <p className="text-center text-sm text-zinc-500">
                {d.hasAccount}{' '}
                <Link href={`/${lang}/login`} className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                    {d.login}
                </Link>
            </p>
        </div>
    );
}
