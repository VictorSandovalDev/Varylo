'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
}

export async function updateProfile(data: { name: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'No autorizado' };
    }

    const name = data.name?.trim();
    if (!name || name.length < 2 || name.length > 100) {
        return { success: false, message: 'El nombre debe tener entre 2 y 100 caracteres' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
    });

    revalidatePath('/[lang]/agent/profile', 'page');
    return { success: true };
}

export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'No autorizado' };
    }

    const { currentPassword, newPassword, confirmPassword } = data;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: 'Todos los campos son requeridos' };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: 'Las contraseñas nuevas no coinciden' };
    }

    if (newPassword.length < 8) {
        return { success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres' };
    }

    if (newPassword.length > 128) {
        return { success: false, message: 'La contraseña es demasiado larga' };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
        return { success: false, message: 'No se puede cambiar la contraseña de esta cuenta' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
        return { success: false, message: 'La contraseña actual es incorrecta' };
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: newHash },
    });

    return { success: true };
}
