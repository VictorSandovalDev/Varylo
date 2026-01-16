'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function SubmitButton({ text, pendingText }: { text: string, pendingText: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? pendingText : text}
        </Button>
    );
}

export default function RegisterForm({ dict }: { dict: any }) {
    const [errorMessage, dispatch] = useActionState(register, undefined);

    return (
        <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="companyName">{dict.companyNameLabel}</Label>
                <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder={dict.companyNamePlaceholder}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">{dict.nameLabel}</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={dict.namePlaceholder}
                    required
                />
            </div>
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
            <div className="space-y-2">
                <Label htmlFor="plan">{dict.planLabel}</Label>
                <Select name="plan" defaultValue="STARTER">
                    <SelectTrigger>
                        <SelectValue placeholder={dict.planPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="STARTER">Starter</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="SCALE">Scale</SelectItem>
                    </SelectContent>
                </Select>
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
