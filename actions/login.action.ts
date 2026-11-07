'use server';

import * as z from 'zod';

import { LoginSchema } from '@/schemas';
import { signIn, signOut } from '@/auth';
import { getSafeRedirect } from '@/routes';
import { AuthError } from 'next-auth';

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  try {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) return { error: 'invalid credentials' };
    const { email, password } = validatedFields.data;

    await signIn('credentials', { email, password, redirectTo: getSafeRedirect(callbackUrl) });

    return { success: true, message: 'login successful' };
  } catch (error) {
    console.error('error type ***:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'invalid credentials' };
        case 'CallbackRouteError':
          return { error: 'Please verify your email before logging in' };
        case 'OAuthSignInError':
          return { error: 'invalid credentials' };

        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }
};

export const providerLogin = async (provider: 'google' | 'github', callbackUrl?: string | null) =>
  await signIn(provider, { redirectTo: getSafeRedirect(callbackUrl) });

export const logout = async () => await signOut({ redirectTo: '/' });
