'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton({ text, pendingText }: { text: string, pendingText: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? pendingText : text}
        </Button>
    );
}

export default function LoginForm({ dict }: { dict: any }) {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="space-y-6">
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
            <div className="space-y-2">
                <Label htmlFor="password">{dict.passwordLabel}</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>
            <div>
                {errorMessage && (
                    <p className="text-sm text-red-500 mb-2">{errorMessage}</p>
                )}
                <SubmitButton text={dict.submitButton} pendingText={dict.submitButtonPending} />
            </div>
        </form>
    );
}
