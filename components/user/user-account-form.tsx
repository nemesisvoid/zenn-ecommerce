'use client';

import * as z from 'zod';
import { updateUser } from '@/actions/user.action';
import { useTransition } from 'react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserAccountSettingsSchema } from '@/schemas';
import { toast } from 'sonner';

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
        console.log(error);
      }
    });
  };
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Account Settings</h3>
        <p className='text-sm text-muted-foreground'>Manage your account security and preferences.</p>
      </div>
      <Separator />

      {/* Password Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <FormField
                  name='oldPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid gap-2'>
                <FormField
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className='border-t px-6 py-4'>
              <Button>{isPending ? 'Updating...' : 'Update Password'}</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* Danger Zone */}
      <Card className='border-destructive/50'>
        <CardHeader>
          <CardTitle className='text-destructive'>Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>Deleting your account is permanent. All your data and order history will be wiped.</p>
        </CardContent>
        <CardFooter className='border-t border-destructive/10 px-6 py-4 bg-destructive/5'>
          <Button variant='destructive'>Delete Account</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserAccountForm;
