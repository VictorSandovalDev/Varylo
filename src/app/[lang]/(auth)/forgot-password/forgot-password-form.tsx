'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset } from './actions';
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

export default function ForgotPasswordForm({ dict, lang }: { dict: any; lang: string }) {
  const [state, dispatch] = useActionState(requestPasswordReset, undefined);

  return (
    <>
      {state?.success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">{dict.success}</p>
        </div>
      ) : (
        <form action={dispatch} className="space-y-6">
          <input type="hidden" name="lang" value={lang} />
          <div className="space-y-2">
            <Label htmlFor="email">{dict.emailLabel}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}
          <SubmitButton text={dict.submitButton} pendingText={dict.submitButtonPending} />
        </form>
      )}
    </>
  );
}
