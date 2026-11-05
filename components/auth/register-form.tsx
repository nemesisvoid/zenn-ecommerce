'use client';

import { useState, useTransition } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import CardWrapper from './card-wrapper';
import { RegisterSchema } from '@/schemas';

import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import FormError from '../misc/form-error';
import FormSuccess from '../misc/form-success';
import { register } from '@/actions/register.action';
import Spinner from '@/components/shared/spinner';
import PasswordInput from './password-input';
import { authInput, authPrimaryButton } from './auth-styles';

const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  // const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setSuccess('');
    setError('');
    startTransition(() => {
      register(values).then(data => {
        setError(data.error);
        setSuccess(data.message);
        form.reset();
      });
    });
  };
  return (
    <CardWrapper
      headerLabel='Create your account'
      headerDescription='Join Zenn to check out faster and keep track of every order.'
      backButtonLabel='Already have an account?'
      backButtonCta='Sign in'
      backButtonLink='/auth/login'
      showSocial>
      <Form {...form}>
        <form
          action=''
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'>
          <div className='space-y-5'>
            <div className='grid gap-5 sm:grid-cols-2 sm:gap-4'>
              <FormField
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='auth-label'>First name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={authInput}
                        placeholder='Ada'
                        type='text'
                        autoComplete='given-name'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                control={form.control}
              />
              <FormField
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='auth-label'>Last name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={authInput}
                        placeholder='Okafor'
                        type='text'
                        autoComplete='family-name'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                control={form.control}
              />
            </div>
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
                  <FormLabel className='auth-label'>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder='Create a password'
                      autoComplete='new-password'
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
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
