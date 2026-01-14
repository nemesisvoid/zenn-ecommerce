'use client';

import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { SystemSettingsSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createSettings, updateSettings } from '@/actions/settings.actions';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

type AdminShippingSettingsFormProps = {
  id?: string;
  initialData: z.infer<typeof SystemSettingsSchema>;
};
const AdminSystemSettingsForm = ({ id, initialData }: AdminShippingSettingsFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(SystemSettingsSchema),
    defaultValues: initialData
      ? {
          maintenanceMode: initialData.maintenanceMode,
          enableReviews: initialData.enableReviews,
        }
      : {
          maintenanceMode: false,
          enableReviews: true,
        },
  });

  const onSubmit = (data: z.infer<typeof SystemSettingsSchema>) => {
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
  const { watch } = form;
  const mode = watch('maintenanceMode');
  console.log('mode', mode);
  return (
    <Form {...form}>
      <form
        className='flex flex-col gap-4 my-6'
        onSubmit={form.handleSubmit(onSubmit)}>
        <div className='gri grid-cols-1 lg:grid-cols-2 gap-8 space-y-8'>
          <FormField
            control={form.control}
            name='maintenanceMode'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Maintenance Mode</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='enableReviews'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Enable Reviews</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode && <span className='text-red-500'>website is currently in maintenance mode</span>}
        </div>

        <Button
          className='w-fit py-6 cursor-pointer mt-6'
          disabled={isPending}>
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

export default AdminSystemSettingsForm;
