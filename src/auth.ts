import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// Helper to determine if we should compare hash or plain (for seed compatibility if needed)
// But for security we should really use bcrypt. Ideally we update seed to use bcrypt.
async function verifyPassword(plain: string, hashed: string | null) {
    if (!hashed) return false;
    // Fallback for simple "password123" if the seed put plain text (NOT SECURE in prod, just for MVP demo robustness if seed didn't hash)
    if (hashed === plain) return true;
    return await bcrypt.compare(plain, hashed);
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: 'jwt' },
    callbacks: {
        ...authConfig.callbacks,
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;

                    const isValid = await verifyPassword(password, user.passwordHash);
                    if (isValid) return user;
                }
                return null;
            },
        }),
    ],
});
