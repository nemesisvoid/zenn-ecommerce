import NextAuth from 'next-auth';
import authConfig from './auth.config';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from './lib/prisma';
import { getUserById } from './data/user';
import { cookies } from 'next/headers';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { LoginSchema } from './schemas';
import { sendAdminNotificationMail, sendUserWelcomeMail } from './helper/send-mail';
import { passwordVersion } from './lib/password-session';
import { mergeGuestCart } from './lib/cart';
import type { Prisma } from '@prisma/client';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...authConfig.providers,
    Credentials({
      authorize: async credentials => {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          // Use Prisma directly here
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          if (!user?.isEmailVerified) throw new Error('Please verify your email before logging in.');

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) {
            // Return only what Auth.js uses (id/name/email/image seed the JWT) so the
            // bcrypt hash never leaves this function.
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name;
      }

      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },

    async jwt({ token, user, trigger }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return null;

      const currentPasswordVersion = passwordVersion(existingUser.password);
      if (trigger === 'signIn' || trigger === 'signUp') {
        token.passwordVersion = currentPasswordVersion;
      } else if (token.passwordVersion !== currentPasswordVersion) {
        return null;
      }

      token.name = existingUser.name || [existingUser.firstName, existingUser.lastName].filter(Boolean).join(' ').trim() || token.name || '';
      token.email = existingUser.email;
      token.picture = existingUser.avatar || existingUser.image || null;
      token.role = existingUser.role;
      if (trigger === 'signIn' || trigger === 'signUp') {
        const cookie = await cookies();
        const sessionCartId = cookie.get('sessionCartId')?.value;

        // Merge this browser's guest cart into the account's cart (never replace it).
        // A cart problem must never block signing in.
        if (sessionCartId && user?.id) {
          try {
            await mergeGuestCart(sessionCartId, user.id);
          } catch (err) {
            console.error('guest cart merge failed', err);
          }
        }
      }
      return token;
    },
  },
  // `error` is not an Auth.js callback (it was never invoked); the logger is the supported hook.
  logger: {
    error(error) {
      console.error('Auth Error:', error);
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const updateData: Prisma.UserUpdateInput = {
          isEmailVerified: true,
          emailVerified: new Date(),
          lastLogin: new Date(),
        };

        if (!user.firstName && user.name) {
          const parts = user.name.split(' ').filter(Boolean);
          if (parts.length) {
            updateData.firstName = parts[0];
            if (parts.length > 1) updateData.lastName = parts.slice(1).join(' ');
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    },

    // Fires when the Prisma adapter creates a user (OAuth sign-up). Credentials
    // sign-ups send these mails from register.action.ts / the verify-email route instead.
    async createUser({ user }) {
      if (!user.email) return;
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } });
      await Promise.all([
        ...admins.map(admin => sendAdminNotificationMail(admin.email, user)),
        sendUserWelcomeMail(user.email, user.name ?? user.firstName ?? ''),
      ]);
    },
  },
});
