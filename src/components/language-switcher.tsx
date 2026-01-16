'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    // Assumption: pathname always starts with /en or /es due to middleware
    const currentLocale = pathname.split('/')[1] || 'es';

    const handleValueChange = (newLocale: string) => {
        const segments = pathname.split('/');
        segments[1] = newLocale;
        const newPath = segments.join('/');
        router.push(newPath);
    };

    return (
        <Select value={currentLocale} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
            </SelectContent>
        </Select>
    );
}
