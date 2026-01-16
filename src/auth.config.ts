import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.companyId = user.companyId;
                token.id = user.id;
            }
            // Support updating session on the client
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as any;
                session.user.companyId = token.companyId as string | null;
                session.user.id = token.id as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Strip locale to check routes generically
            // /en/super-admin -> /super-admin
            const segments = nextUrl.pathname.split('/');
            // segments[0] is empty, segments[1] is locale (or path if missing), etc.
            // But getting a "pathWithoutLocale" is safer.
            // Assumption: Middleware ensures we usually have locale, but here we might not?
            // "authorized" runs AFTER middleware? Yes.
            // So path likely has locale: /es/...
            const pathWithoutLocale = '/' + segments.slice(2).join('/');

            const isSuperAdminRoute = pathWithoutLocale.startsWith('/super-admin');
            const isCompanyRoute = pathWithoutLocale.startsWith('/company');
            const isAgentRoute = pathWithoutLocale.startsWith('/agent');
            const isDashboardRoute = pathWithoutLocale.startsWith('/dashboard');

            if (isSuperAdminRoute || isCompanyRoute || isAgentRoute || isDashboardRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Allow access to other pages (marketing)
            return true;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
