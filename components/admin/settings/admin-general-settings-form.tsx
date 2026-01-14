'use client';

import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { GeneralSettingsSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createSettings, updateSettings } from '@/actions/settings.actions';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';

type AdminGeneralSettingsFormProps = {
  id?: string;
  initialData: z.infer<typeof GeneralSettingsSchema>;
};

const AdminGeneralSettingsForm = ({ id, initialData }: AdminGeneralSettingsFormProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(GeneralSettingsSchema),
    defaultValues: initialData
      ? {
          storeName: initialData.storeName,
          storeEmail: initialData.storeEmail,
          storePhone: initialData.storePhone,
          storeAddress: initialData.storeAddress,
        }
      : {
          storeName: '',
          storeEmail: '',
          storePhone: '',
          storeAddress: undefined,
        },
  });

  const onSubmit = (data: z.infer<typeof GeneralSettingsSchema>) => {
    startTransition(async () => {
      try {
        if (initialData) {
          const res = await updateSettings(id!, data);
          toast.success(res.message);
        } else {
          const res = await createSettings(data);
          toast.success(res.message);
        }
      } catch (error) {
        console.log('Error updating general settings:', error);
      }
    });
  };
  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-4 my-6'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <FormField
            control={form.control}
            name='storeName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input
                    className='py-6'
                    placeholder='Store name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='storeEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Email</FormLabel>
                <FormControl>
                  <Input
                    className='py-6'
                    placeholder='Store Email'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 my-5'>
          <FormField
            control={form.control}
            name='storePhone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Phone</FormLabel>
                <FormControl>
                  <Input
                    className='py-6'
                    placeholder='Store Phone'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='storeAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Address</FormLabel>
                <FormControl>
                  <Input
                    className='py-6'
                    placeholder='Store Address'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className='w-fit py-6 cursor-pointer'
          disabled={isPending}>
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default AdminGeneralSettingsForm;
