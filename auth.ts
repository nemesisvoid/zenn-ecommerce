import NextAuth from 'next-auth';
import authConfig from './auth.config';
// import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from './lib/prisma';
import { getUserById } from './data/user';
import { cookies } from 'next/headers';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { LoginSchema } from './schemas';

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

          if (passwordMatch) return user;
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

      if (!existingUser) return token;

      token.name = (token.name ?? existingUser.name ?? [existingUser.firstName, existingUser.lastName].filter(Boolean).join(' ').trim()) || '';
      token.role = existingUser.role;
      if (trigger === 'signIn' || trigger === 'signUp') {
        const cookie = await cookies();
        const sessionCartId = cookie.get('sessionCartId')?.value;

        if (sessionCartId) {
          const sessionCart = await prisma.cart.findFirst({
            where: { sessionCartId },
          });

          if (sessionCart) {
            await prisma.cart.deleteMany({
              where: { userId: user.id },
            });

            await prisma.cart.update({
              where: { id: sessionCart.id },
              data: { userId: user.id },
            });
          }
        }
      }
      return token;
    },

    async error(error) {
      console.error('Auth Error:', error);
      return error;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const updateData: any = {
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
  },
});
