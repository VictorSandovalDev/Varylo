'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(
  _prevState: { success?: boolean; error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const lang = (formData.get('lang') as string) || 'es';

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Check if user exists (but always return same response)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = hashToken(rawToken);

      // Store hashed token in DB
      await prisma.passwordResetToken.create({
        data: {
          email,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send email with raw token
      await sendPasswordResetEmail(email, rawToken, lang);
    }

    // Always return success to not reveal if email exists
    return { success: true };
  } catch (err) {
    console.error('[PasswordReset] Error:', err);
    return { error: 'No se pudo enviar el correo. Intenta de nuevo más tarde.' };
  }
}
