'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';

import { OrderSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { CartType } from '@/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { PaymentMethods } from '@/constants';
import { Button } from '../ui/button';
import Image from 'next/image';
import { formatCurrency } from '@/helper/utils';
import { useTransition } from 'react';
import { createOrder } from '@/actions/order.action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type PaymentFormProps = {
  user: { id: string | undefined; name: string | undefined | null; email: string | undefined | null };
  cart: CartType | undefined;
};

export const PaymentForm = ({ user, cart }: PaymentFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof OrderSchema>>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      userId: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: '',
      country: '',
      city: '',
      postalCode: '',
      address: '',
      paymentMethod: 'PAYSTACK',
    },
  });
  const handleCreateOrder = async (data: z.infer<typeof OrderSchema>) => {
    console.log('submitting');
    const newData = { cart, phoneNo: data.phone, ...data };
    console.log('newData', newData);
    startTransition(async () => {
      const res = await createOrder(newData);
      if (!res?.orderId) throw new Error(res?.message);
      toast.success(res.message);

      router.replace(res.auth_url);
    });
  };
  return (
    <Form {...form}>
      <form
        action=''
        onSubmit={form.handleSubmit(handleCreateOrder)}>
        <div className='flex gap-14 justify-center'>
          <div className='space-y-6 w-[40%]'>
            <div className='space-y-10'>
              <h3 className='font-medium'>Customer Details</h3>
              <FormField
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-10'>
              <h3>Billing Address</h3>
              <FormField
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='flex items-center'>
                <FormField
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <aside className='w-1/2 flex flex-col gap-14'>
            <div className='space-y-10'>
              <h3 className='font-medium'>Order Summary</h3>
              <div className='flex flex-col gap-6'>
                {cart?.cartItems?.map(item => (
                  <figure
                    key={item.id}
                    className='flex item-center gap-5'>
                    {item.variants
                      ? item.variants?.images.slice(1, 2).map(img => (
                          <div
                            key={img}
                            className='relative aspect-square size-20'>
                            <Image
                              src={img}
                              fill
                              alt='product image'
                              className='object-cover rounded-md'
                            />
                          </div>
                        ))
                      : item.products?.images.slice(1, 2).map(img => (
                          <div
                            key={img}
                            className='relative aspect-square size-20'>
                            <Image
                              src={img}
                              fill
                              alt='product image'
                              className='object-cover rounded-md'
                            />
                          </div>
                        ))}

                    <div className='flex flex-col justify-between'>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>{item.products?.name}</p>
                        <p className='text-xs'>x{item.quantity}</p>
                      </div>
                      <p>{formatCurrency(item.price)}</p>
                    </div>
                  </figure>
                ))}
              </div>
            </div>

            <div className='space-y-5'>
              <h3 className='font-medium'>Payment Method</h3>
              <FormField
                name='paymentMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        className='space-y-2'>
                        {PaymentMethods.map(method => (
                          <div
                            className='flex items-center space-x-2'
                            key={method}>
                            <RadioGroupItem
                              value={method}
                              id={method}
                            />
                            <FormLabel htmlFor={method}>{method}</FormLabel>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Review Order</h3>
              <p className='text-gray-500 text-sm'>Please review the order and payment details before proceeding to confirm your order.</p>
            </div>

            <Button
              className='text-xl cursor-pointer mt-auto w-fit px-10 rounded-3xl py-6'
              disabled={isPending}
              type='submit'>
              Place Order
            </Button>
          </aside>
        </div>
      </form>
    </Form>
  );
};
