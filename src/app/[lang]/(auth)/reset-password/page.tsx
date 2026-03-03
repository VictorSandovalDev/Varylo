import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  const { token } = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.auth.resetPassword;

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
          <p className="mt-2 text-sm text-red-500">{d.invalidToken}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href={`/${lang}/forgot-password`} className="font-medium text-primary hover:underline">
            {dict.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{d.subtitle}</p>
      </div>
      <ResetPasswordForm dict={d} token={token} lang={lang} />
    </div>
  );
}
