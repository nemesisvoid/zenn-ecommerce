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
import { ArrowRightIcon, LoaderIcon } from 'lucide-react';

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
    startTransition(() => {
      console.log(values);
      login(values).then(data => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  console.log(form);
  return (
    <CardWrapper
      headerLabel='Welcome Back!'
      backButtonLabel="Don't have an account?"
      backButtonLink='/auth/register'
      showSocial>
      <Form {...form}>
        <form
          action=''
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6 '>
          <div className='space-y-5'>
            <FormField
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xl text-white/70 mb-2'>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='py-5'
                      placeholder='Enter your email'
                      type='email'
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
                  <FormLabel className='text-xl text-white/70 mb-2'>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='py-5'
                      placeholder='*******'
                      type='password'
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
            className='w-full text-xl py-6 cursor-pointer'
            type='submit'
            disabled={isPending}>
            Login
            {isPending && <LoaderIcon className='animate-spin' />}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
