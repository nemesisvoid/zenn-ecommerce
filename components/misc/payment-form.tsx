'use client';

import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

import { OrderSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { CartItemType, CartType } from '@/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { PaymentMethods } from '@/constants';
import { Button } from '../ui/button';
import Image from 'next/image';
import { formatCurrency } from '@/helper/utils';
import { useTransition } from 'react';
import { createOrder, createOrderPayOnDelivery, createOrderPaystack } from '@/actions/order.action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type PaymentFormProps = {
  user: { id: string | undefined; name: string | undefined | null; email: string | undefined | null };
  cart: CartType | undefined;
  selectedProducts: CartItemType[];
};

export const PaymentForm = ({ user, cart, selectedProducts }: PaymentFormProps) => {
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

  const pay = form.watch('paymentMethod');
  console.log(pay);
  const handleCreateOrder = async (data: z.infer<typeof OrderSchema>) => {
    console.log('submitting');
    const newData = { cart, phoneNo: data.phone, ...data };
    console.log('newData', newData);
    startTransition(async () => {
      if (data.paymentMethod === 'PAYSTACK') {
        const res = await createOrderPaystack(newData);
        if (!res?.orderId) throw new Error(res?.message);
        toast.success(res.message);
        router.replace(res.auth_url);
      } else if (data.paymentMethod === 'PAY_ON_DELIVERY') {
        try {
          const res = await createOrderPayOnDelivery(newData);
          if (!res?.orderId) throw new Error(res?.message);
          toast.success(res.message);
          router.replace(`/order/${res.orderId}`);
        } catch (err) {
          toast.error('Error placing order on delivery');
          console.log('error placing order on delivery', err);
        }
      }
    });
  };
  return (
    <Form {...form}>
      <form
        action=''
        onSubmit={form.handleSubmit(handleCreateOrder)}>
        <div className='flex flex-col md:flex-row gap-12 lg:gap-20 justify-center'>
          <div className='space-y-6 md:w-[40%]'>
            <div className='space-y-10'>
              <h3 className='font-medium'>Customer Details</h3>
              <FormField
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        // value={field.value}
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
                    <FormMessage />
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

              <div className='flex items-center sm:gap-6 justify-between'>
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

          <aside className='md:w-1/2 flex flex-col gap-14'>
            <div className='space-y-10'>
              <h3 className='font-medium'>Order Summary</h3>
              <div className='flex flex-col gap-6'>
                {selectedProducts.map((item, index) => (
                  <figure
                    key={index}
                    className='flex item-center gap-5'>
                    <div className='relative aspect-square size-20'>
                      <Image
                        src={item.images[0]}
                        fill
                        alt='product image'
                        className='object-cover rounded-md'
                      />
                    </div>

                    <div className='flex flex-col justify-between'>
                      <div className='flex flex-col gap-1'>
                        <p className='text-sm'>{item.products?.name}</p>
                        <p className='text-xs'>x{item.quantity}</p>
                      </div>
                      <p className='text-sm'>{item.variantId ? item.color : ''}</p>
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
                            <FormLabel htmlFor={method}>{method === 'PAY_ON_DELIVERY' ? method.split('_').join(' ') : method}</FormLabel>
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
              className='text-xl cursor-pointer mt-auto w-fit px-10 rounded-3xl py-6 md:translate-x-5'
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
