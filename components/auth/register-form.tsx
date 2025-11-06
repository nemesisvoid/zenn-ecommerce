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
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const router = useRouter();
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
      console.log(values);
      register(values).then(data => {
        setError(data.error);
        setSuccess(data.success);
      });
      if (success) router.push('/auth/login');
    });
  };
  console.log(form);
  return (
    <CardWrapper
      headerLabel='Create an account'
      backButtonLabel='Already have an account?'
      backButtonLink='/auth/login'
      showSocial>
      <Form {...form}>
        <form
          action=''
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6 '>
          <div className='space-y-5'>
            <FormField
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xl text-black/80 mb-2'>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='py-5'
                      placeholder='John'
                      type='text'
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
                  <FormLabel className='text-xl text-black/80 mb-2'>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className='py-5'
                      placeholder='Smith'
                      type='text'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
            />
            <FormField
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xl text-black/80 mb-2'>Email</FormLabel>
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
                  <FormLabel className='text-xl text-black/85 mb-2'>Password</FormLabel>
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
          <FormSuccess message={success} />
          <Button
            className='w-full text-xl py-6 cursor-pointer'
            type='submit'
            disabled={isPending}>
            {isPending ? 'Creating' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
