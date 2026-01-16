import RegisterForm from './register-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function RegisterPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const d = dict.auth.register;

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-lg dark:bg-zinc-950">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {d.subtitle}
                    </p>
                </div>
                <RegisterForm dict={d} />
            </div>
        </div>
    );
}
