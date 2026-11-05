import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().max(254).email('Enter a valid email'),
});

export const ResetTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').refine(
    value => new TextEncoder().encode(value).length <= 72,
    'Password must be at most 72 bytes',
  ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
