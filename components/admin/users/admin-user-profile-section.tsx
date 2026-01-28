import * as z from 'zod';
import { AdminUserSchema } from '@/schemas';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';

const AdminUserProfileSection = ({ form }: { form: UseFormReturn<z.infer<typeof AdminUserSchema>> }) => {
  return (
    <div className='admin-card rounded-md py-4 px-0 mb-10'>
      <div>
        <h2 className='text-sm font-medium mx-5 mb-2'>User Information</h2>
      </div>

      <div className='border-b border-gray-300 dark:border-gray-600' />

      <div className='px-5 my-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10 my-8'>
          <FormField
            name='name'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name='email'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          <FormField
            name='address'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Address</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name='phone'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Phone</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfileSection;
