import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

import bcrypt from 'bcryptjs';

import { LoginSchema } from './schemas';
import { getUserByEmail } from './data/user';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async credentials => {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) return user;
        }
        return null;
      },
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
