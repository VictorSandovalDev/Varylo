'use server';

import { prisma } from '@/lib/prisma';
import { sendContactNotificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function submitContact(prevState: unknown, formData: FormData) {
    // Rate limit: 5 submissions per minute per IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown';
    const rl = checkRateLimit(ip, { prefix: 'contact-form', limit: 5, windowSeconds: 60 });
    if (!rl.success) {
        return { success: false, message: 'Demasiados intentos. Intenta de nuevo en un momento.' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        return { success: false, message: 'All fields are required.' };
    }

    try {
        await prisma.contactLead.create({
            data: {
                name,
                email,
                message
            }
        });
    } catch (error) {
        console.error('Error saving contact lead:', error);
        return { success: false, message: 'Failed to send message.' };
    }

    try {
        await sendContactNotificationEmail(name, email, message);
    } catch (error) {
        console.error('Error sending contact notification email:', error);
    }

    return { success: true, message: 'Message sent!' };
}
