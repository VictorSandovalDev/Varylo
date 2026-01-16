'use server';

import { prisma } from '@/lib/prisma';
// import { revalidatePath } from 'next/cache';

export async function submitContact(prevState: unknown, formData: FormData) {
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
        return { success: true, message: 'Message sent!' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Failed to send message.' };
    }
}
