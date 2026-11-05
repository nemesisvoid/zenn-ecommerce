'use server';

import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPasswordResetService, RESET_REQUEST_MESSAGE } from '@/lib/password-reset';
import { ForgotPasswordSchema } from '@/schemas/password-reset';
import { assertPasswordResetMailConfigured, sendPasswordResetMail, sendPasswordChangedMail } from '@/helper/send-mail';

const service = createPasswordResetService(prisma, sendPasswordResetMail, sendPasswordChangedMail);

export async function requestPasswordReset(values: unknown) {
  const parsed = ForgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: 'Enter a valid email' };
  try {
    assertPasswordResetMailConfigured();
  } catch (error) {
    // This validator only reports setting names, never their secret values.
    const message = error instanceof Error ? error.message : 'Password reset email is not configured.';
    console.error('Password reset configuration:', message);
    return {
      error: process.env.NODE_ENV === 'development' ? message : 'Password reset is temporarily unavailable. Please try again later.',
    };
  }
  try {
    // Respond before account lookup/email delivery so account existence does not
    // affect the response text or delivery-dependent response time.
    after(async () => {
      try {
        await service.request(parsed.data);
      } catch {
        console.error('Password reset request could not be processed');
      }
    });
    return { success: RESET_REQUEST_MESSAGE };
  } catch {
    return { error: 'Password reset is temporarily unavailable. Please try again later.' };
  }
}

export async function resetPassword(token: unknown, values: unknown) {
  try {
    return await service.reset(token, values);
  } catch {
    console.error('Password reset could not be completed');
    return { error: 'Unable to reset your password right now. Please try again.' };
  }
}
