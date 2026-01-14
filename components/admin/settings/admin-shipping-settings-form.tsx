'use client';

import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { ShippingSettingsSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createSettings, updateSettings } from '@/actions/settings.actions';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { toast } from 'sonner';

const FREE_SHIPPING_THRESHOLD_DEFAULT = 800000;

type AdminShippingSettingsFormProps = {
  id?: string;
  initialData: z.infer<typeof ShippingSettingsSchema>;
};

const AdminShippingSettingsForm = ({ id, initialData }: AdminShippingSettingsFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(ShippingSettingsSchema),
    defaultValues: initialData
      ? {
          shippingFee: initialData.shippingFee,
          taxRate: initialData.taxRate,
          freeShippingThreshold: initialData.freeShippingThreshold,
        }
      : {
          shippingFee: 0,
          taxRate: 0,
          freeShippingThreshold: FREE_SHIPPING_THRESHOLD_DEFAULT,
        },
  });

  const { watch } = form;
  const shippingFeePercentage = Number(watch('shippingFee'));
  const taxRatePercentage = Number(watch('taxRate'));

  // Format percentages to avoid floating point precision issues (e.g. 0.07 * 100 -> 7.00000001)
  const formattedShippingPercentage = Number((shippingFeePercentage * 100).toFixed(2));
  const formattedTaxPercentage = Number((taxRatePercentage * 100).toFixed(2));

  const onSubmit = (data: z.infer<typeof ShippingSettingsSchema>) => {
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
          <div>
            <FormField
              control={form.control}
              name='shippingFee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Fee</FormLabel>
                  <FormControl>
                    <Input
                      className='py-6'
                      {...field}
                      type='number'
                      step={0.01}
                      min={0}
                      max={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!shippingFeePercentage ? (
              <span className='text-gray-500'>No shipping fee applied to your store</span>
            ) : (
              <span className='text-gray-500'>Your store shipping fee percentage is {formattedShippingPercentage}%</span>
            )}
          </div>

          <div>
            <FormField
              control={form.control}
              name='taxRate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate</FormLabel>
                  <FormControl>
                    <Input
                      className='py-6'
                      {...field}
                      type='number'
                      step={0.01}
                      min={0}
                      max={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!taxRatePercentage ? (
              <span className='text-gray-500'>No tax rate applied to your store</span>
            ) : (
              <span className='text-gray-500'>Your store tax rate percentage is {formattedTaxPercentage}%</span>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 my-5'>
          <FormField
            control={form.control}
            name='freeShippingThreshold'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Free Shipping Threshold</FormLabel>
                <FormControl>
                  <Input
                    className='py-6'
                    {...field}
                    type='number'
                    step={1000}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name='paymentMethod'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Methods</FormLabel>
                <FormControl>
                  {(() => {
                    const current = field.value;
                    const obj = Array.isArray(current) ? current[0] ?? {} : current ?? {};

                    const setObj = (newObj: any) => {
                      if (Array.isArray(current)) {
                        field.onChange([newObj]);
                      } else {
                        field.onChange(newObj);
                      }
                    };

                    return (
                      <div className='flex flex-col gap-2'>
                        <label className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={!!obj.paystack}
                            onChange={e => setObj({ ...obj, paystack: e.target.checked })}
                          />
                          <span>Paystack</span>
                        </label>

                        <label className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={!!obj.payOnDelivery}
                            onChange={e => setObj({ ...obj, payOnDelivery: e.target.checked })}
                          />
                          <span>Pay on Delivery</span>
                        </label>
                      </div>
                    );
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
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

export default AdminShippingSettingsForm;

// Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
