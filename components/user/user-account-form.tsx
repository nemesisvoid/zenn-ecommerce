'use client';

import * as z from 'zod';
import { updateUser } from '@/actions/user.action';
import { useTransition } from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserAccountSettingsSchema } from '@/schemas';
import { toast } from 'sonner';
import { storeInput, storeLabel, storePrimaryButton } from '@/components/shared/form-styles';
import SettingsHeader from './settings-header';

interface UserAccountFormProps {
  initialData: any;
}
const UserAccountForm = ({ userId }: { userId: string }) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof UserAccountSettingsSchema>>({
    resolver: zodResolver(UserAccountSettingsSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });
  const onSubmit = async (data: z.infer<typeof UserAccountSettingsSchema>) => {
    startTransition(async () => {
      try {
        const res = await updateUser(userId, data);
        if (res?.success) {
          toast.success(res?.message);
        } else {
          toast.error(res?.message || 'Failed to update profile');
        }
      } catch (error) {
        toast.error('something went wrong');
        console.error(error);
      }
    });
  };
  return (
    <div>
      <SettingsHeader
        title='Security'
        description='Manage your password and account.'
      />

      <div className='space-y-6'>
        {/* Password Section */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='panel'>
            <div className='p-6 md:p-8'>
              <h3 className='text-[0.9375rem] font-semibold text-foreground'>Password</h3>
              <p className='mt-1 text-sm text-muted-foreground'>Use a strong password you don&apos;t use anywhere else.</p>
              <div className='mt-6 grid gap-5 md:max-w-md'>
                <FormField
                  name='oldPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={storeLabel}>Current password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          autoComplete='current-password'
                          className={storeInput}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={storeLabel}>New password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          autoComplete='new-password'
                          className={storeInput}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='flex justify-end border-t border-border px-6 py-4 md:px-8'>
              <Button className={storePrimaryButton}>{isPending ? 'Updating…' : 'Update password'}</Button>
            </div>
          </form>
        </Form>

        {/* Danger Zone */}
        <section className='panel border-destructive/30'>
          <div className='p-6 md:p-8'>
            <h3 className='text-[0.9375rem] font-semibold text-destructive'>Delete account</h3>
            <p className='mt-1 max-w-prose text-sm text-muted-foreground'>
              Deleting your account is permanent. All your data and order history will be wiped.
            </p>
          </div>
          <div className='flex justify-end border-t border-destructive/20 bg-destructive/5 px-6 py-4 md:px-8'>
            <Button
              variant='destructive'
              className='h-10 cursor-pointer rounded-full px-5'>
              Delete account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserAccountForm;
