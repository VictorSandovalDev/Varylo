'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { resetPassword } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton({ text, pendingText }: { text: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingText : text}
    </Button>
  );
}

export default function ResetPasswordForm({
  dict,
  token,
  lang,
}: {
  dict: any;
  token: string;
  lang: string;
}) {
  const [state, dispatch] = useActionState(resetPassword, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">{dict.success}</p>
        </div>
        <p className="text-center">
          <Link href={`/${lang}/login`} className="text-sm font-medium text-primary hover:underline">
            {dict.submitButton.includes('Reset') || dict.submitButton.includes('Restablecer')
              ? lang === 'es' ? 'Ir a iniciar sesión' : 'Go to sign in'
              : dict.submitButton}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">{dict.passwordLabel}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{dict.confirmPasswordLabel}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
      <SubmitButton text={dict.submitButton} pendingText={dict.submitButtonPending} />
    </form>
  );
}
