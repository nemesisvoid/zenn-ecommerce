import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // 3. Session callback: Copy the role from the token to the session user
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // THIS IS THE KEY PART MISSING IN MIDDLEWARE
      if (token.role && session.user) {
        session.user.role = token.role as 'ADMIN' | 'USER';
      }

      return session;
    },

    async jwt({ token }) {
      return token;
    },
  },
} satisfies NextAuthConfig;
