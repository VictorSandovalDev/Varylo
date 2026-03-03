import Link from 'next/link';
import ForgotPasswordForm from './forgot-password-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const d = dict.auth.forgotPassword;

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{d.subtitle}</p>
      </div>
      <ForgotPasswordForm dict={d} lang={lang} />
      <p className="text-center text-sm text-muted-foreground">
        <Link href={`/${lang}/login`} className="font-medium text-primary hover:underline">
          {d.backToLogin}
        </Link>
      </p>
    </div>
  );
}
