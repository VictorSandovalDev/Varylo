import Link from 'next/link';
import RegisterForm from './register-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function RegisterPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const d = dict.auth.register;

    return (
        <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {d.subtitle}
                </p>
            </div>
            <RegisterForm dict={d} />
            <p className="text-center text-sm text-muted-foreground">
                {d.hasAccount}{' '}
                <Link href={`/${lang}/login`} className="font-medium text-primary hover:underline">
                    {d.login}
                </Link>
            </p>
        </div>
    );
}
