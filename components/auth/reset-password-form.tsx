'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import Spinner from '@/components/shared/spinner';
import { resetPassword } from '@/actions/password-reset.action';
import { ResetPasswordSchema, ResetTokenSchema } from '@/schemas/password-reset';
import CardWrapper from './card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import FormError from '../misc/form-error';
import FormSuccess from '../misc/form-success';
import PasswordInput from './password-input';
import { authPrimaryButton } from './auth-styles';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const validToken = ResetTokenSchema.safeParse(token).success;
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await resetPassword(token, values);
        setError(result.error);
        if (result.success) {
          // Clear any session cookie in this browser so middleware allows the login page.
          await signOut({ redirect: false }).catch(() => undefined);
          form.reset();
          setSuccess(result.success);
          // Remove the secret from the address bar/history after it has been used.
          window.history.replaceState(null, '', '/auth/reset-password');
        }
      } catch {
        setError('Unable to reset your password. Please try again.');
      }
    });
  }

  return (
    <CardWrapper
      headerLabel='Reset password'
      headerDescription='Choose a new password with at least 8 characters.'
      backButtonLabel='Back to sign in'
      backButtonLink='/auth/login'>
      {success ? (
        <div className='space-y-5' aria-live='polite'>
          <FormSuccess message={success} />
          <Button asChild className={authPrimaryButton}><Link href='/auth/login'>Sign in</Link></Button>
        </div>
      ) : !validToken ? (
        <FormError message='This reset link is missing or invalid. Please request a new one.' />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            {(['password', 'confirmPassword'] as const).map(name => (
              <FormField key={name} control={form.control} name={name} render={({ field }) => (
                <FormItem>
                  <FormLabel className='auth-label'>{name === 'password' ? 'New password' : 'Confirm password'}</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete='new-password' disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <div aria-live='polite' className='empty:hidden'><FormError message={error} /></div>
            <Button type='submit' className={authPrimaryButton} disabled={isPending}>
              {isPending && <Spinner aria-hidden='true' />}
              {isPending ? 'Resetting password…' : 'Reset password'}
            </Button>
          </form>
        </Form>
      )}
      {!success && <Link href='/auth/forgot-password' className='auth-link mt-5 inline-block text-sm'>Request a new reset link</Link>}
    </CardWrapper>
  );
}
