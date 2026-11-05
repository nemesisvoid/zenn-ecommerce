'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import Spinner from '@/components/shared/spinner';
import { requestPasswordReset } from '@/actions/password-reset.action';
import { ForgotPasswordSchema } from '@/schemas/password-reset';
import CardWrapper from './card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import FormError from '../misc/form-error';
import FormSuccess from '../misc/form-success';
import { authInput, authPrimaryButton } from './auth-styles';

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      try {
        const result = await requestPasswordReset(values);
        setError(result.error);
        setSuccess(result.success);
      } catch {
        setError('Unable to request a reset link. Please try again.');
      }
    });
  }

  return (
    <CardWrapper
      headerLabel='Forgot password?'
      headerDescription='Enter your account email and we will send you a link to reset your password.'
      backButtonLabel='Back to sign in'
      backButtonLink='/auth/login'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
          <FormField control={form.control} name='email' render={({ field }) => (
            <FormItem>
              <FormLabel className='auth-label'>Email</FormLabel>
              <FormControl>
                <Input {...field} type='email' autoComplete='email' placeholder='you@example.com' className={authInput} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div aria-live='polite' className='empty:hidden space-y-3'>
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>
          <Button type='submit' className={authPrimaryButton} disabled={isPending}>
            {isPending && <Spinner aria-hidden='true' />}
            {isPending ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
      </Form>
      <p className='auth-hint mt-5'>Signed up with Google? Use Continue with Google on the sign-in page instead.</p>
    </CardWrapper>
  );
}
