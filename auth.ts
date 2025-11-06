import NextAuth from 'next-auth';
import authConfig from './auth.config';
// import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from './lib/prisma';
import { getUserById } from './data/user';
import { cookies } from 'next/headers';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
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
      console.log('token', token);
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      console.log({ existingUser });
      if (!existingUser) return token;

      token.name = token.name || `${existingUser.firstName} ${existingUser.lastName}`;
      token.role = existingUser.role;
      console.log('token', token);

      if (trigger === 'signIn' || trigger === 'signUp') {
        const cookie = await cookies();
        const sessionCartId = cookie.get('sessionCartId')?.value;

        console.log('sessionCartId', sessionCartId);

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
});
