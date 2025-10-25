'use server';

import * as z from 'zod';
import { LoginSchema } from '@/schemas';
import { signIn, signOut } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) return { error: 'invalid credentials' };

    const { email, password } = validatedFields.data;

    await signIn('credentials', { email, password, redirectTo: DEFAULT_LOGIN_REDIRECT });

    return { success: true, message: 'login successful' };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'invalid credentials' };
        case 'OAuthSignInError':
          return { error: 'invalid credentials' };

        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }
};

export const providerLogin = async (provider: 'google' | 'github') => await signIn(provider, { redirectTo: '/' });

export const logout = async () => await signOut({ redirectTo: '/' });
