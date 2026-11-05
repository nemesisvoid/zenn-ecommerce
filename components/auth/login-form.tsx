'use client';

import { useState, useTransition } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import CardWrapper from './card-wrapper';
import { LoginSchema } from '@/schemas';

import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import FormError from '../misc/form-error';
import FormSuccess from '../misc/form-success';
import { login } from '@/actions/login.action';
import { useSearchParams } from 'next/navigation';
import BackButton from './back-button';
import { ArrowRightIcon } from 'lucide-react';
import Spinner from '@/components/shared/spinner';
import Link from 'next/link';
import PasswordInput from './password-input';
import { authInput, authPrimaryButton } from './auth-styles';

const LoginForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified');
  // todo const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setSuccess('');
    setError('');
    startTransition(async () => {
      const data = await login(values);
      if (data) {
        setError(data.error);
        setSuccess(data.success ? data.message : undefined);
      }
    });
  };

  return (
    <CardWrapper
      headerLabel='Welcome back'
      headerDescription='Sign in to your Zenn account to continue.'
      backButtonLabel="Don't have an account?"
      backButtonCta='Create one'
      backButtonLink='/auth/register'
      showSocial>
      <Form {...form}>
        <form
          action=''
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'>
          <div className='space-y-5'>
            <FormField
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='auth-label'>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className={authInput}
                      placeholder='you@example.com'
                      type='email'
                      autoComplete='email'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
            />

            <FormField
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between gap-4'>
                    <FormLabel className='auth-label'>Password</FormLabel>
                    <Link
                      href='/auth/forgot-password'
                      className='auth-link text-[0.8125rem]'>
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder='Enter your password'
                      autoComplete='current-password'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
            />
          </div>
          <FormError message={error} />
          {/* <div className='flex items-center justify-between'> */}
          {/*   <div className='flex items-center'> */}
          {/*     <input */}
          {/*       id='remember' */}
          {/*       aria-describedby='remember' */}
          {/*       type='checkbox' */}
          {/*       className='w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500' */}

          {error?.includes('verify') && (
            <BackButton
              label='Verify your email'
              link='/auth/error'
              icon={<ArrowRightIcon />}
            />
          )}
          <FormSuccess message={isVerified ? 'Email verified successfully. Please login.' : ''} />
          <FormSuccess message={success} />
          <Button
            className={authPrimaryButton}
            type='submit'
            disabled={isPending}>
            {isPending && (
              <Spinner
                aria-hidden='true'
              />
            )}
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
