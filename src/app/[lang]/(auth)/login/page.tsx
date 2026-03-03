import LoginForm from './login-form';
import { getDictionary, Locale } from '@/lib/dictionary';

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const d = dict.auth.login;

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{d.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {d.subtitle}
        </p>
      </div>
      <LoginForm dict={d} />
    </div>
  );
}
