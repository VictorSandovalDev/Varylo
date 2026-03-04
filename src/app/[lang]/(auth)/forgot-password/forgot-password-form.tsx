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
        <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
            disabled={pending}
        >
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
                    <p className="text-sm text-emerald-700">{dict.success}</p>
                </div>
            ) : (
                <form action={dispatch} className="space-y-5">
                    <input type="hidden" name="lang" value={lang} />
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
                    {state?.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}
                    <SubmitButton text={dict.submitButton} pendingText={dict.submitButtonPending} />
                </form>
            )}
        </>
    );
}
