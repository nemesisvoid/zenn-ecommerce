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
import { BanknoteIcon, CreditCardIcon, LockIcon } from 'lucide-react';
import Spinner from '@/components/shared/spinner';
import { cn } from '@/lib/utils';
import { storeInput, storeLabel } from '../shared/form-styles';

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

  const handleCreateOrder = async (data: z.infer<typeof OrderSchema>) => {
    const newData = { cart, phoneNo: data.phone, ...data };
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
          console.error('error placing order on delivery', err);
        }
      }
    });
  };
  return (
    <Form {...form}>
      <form
        action=''
        onSubmit={form.handleSubmit(handleCreateOrder)}>
        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10'>
          <div className='space-y-6'>
            <section
              aria-labelledby='checkout-contact'
              className='panel p-6 md:p-8'>
              <h2
                id='checkout-contact'
                className='text-lg font-semibold text-foreground'>
                Contact
              </h2>
              <p className='mt-1 text-sm text-muted-foreground'>We&apos;ll send your receipt and delivery updates here.</p>
              <div className='mt-6 grid gap-5 sm:grid-cols-2'>
                <FormField
                  name='name'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel className={storeLabel}>Full name</FormLabel>
                      <FormControl>
                        <Input
                          // value={field.value}
                          {...field}
                          autoComplete='name'
                          className={storeInput}
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
                      <FormLabel className={storeLabel}>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                          autoComplete='email'
                          className={storeInput}
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
                      <FormLabel className={storeLabel}>Phone number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='tel'
                          autoComplete='tel'
                          className={storeInput}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section
              aria-labelledby='checkout-address'
              className='panel p-6 md:p-8'>
              <h2
                id='checkout-address'
                className='text-lg font-semibold text-foreground'>
                Delivery address
              </h2>
              <div className='mt-6 grid gap-5 sm:grid-cols-2'>
                <FormField
                  name='address'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel className={storeLabel}>Street address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete='street-address'
                          className={storeInput}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name='country'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel className={storeLabel}>Country</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete='country-name'
                          className={storeInput}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={storeLabel}>City</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete='address-level2'
                          className={storeInput}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={storeLabel}>Postal code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete='postal-code'
                          className={storeInput}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section
              aria-labelledby='checkout-payment'
              className='panel p-6 md:p-8'>
              <h2
                id='checkout-payment'
                className='text-lg font-semibold text-foreground'>
                Payment
              </h2>
              <FormField
                name='paymentMethod'
                render={({ field }) => (
                  <FormItem className='mt-6'>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        className='grid gap-3 sm:grid-cols-2'>
                        {PaymentMethods.map(method => (
                          <label
                            htmlFor={method}
                            key={method}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                              field.value === method ? 'border-foreground bg-accent/60' : 'border-input hover:border-muted-foreground',
                            )}>
                            <RadioGroupItem
                              value={method}
                              id={method}
                              className='mt-0.5'
                            />
                            <span>
                              <span className='flex items-center gap-2 text-[0.9375rem] font-medium text-foreground'>
                                {method === 'PAY_ON_DELIVERY' ? (
                                  <BanknoteIcon
                                    className='size-4 text-muted-foreground'
                                    aria-hidden='true'
                                  />
                                ) : (
                                  <CreditCardIcon
                                    className='size-4 text-muted-foreground'
                                    aria-hidden='true'
                                  />
                                )}
                                {method === 'PAY_ON_DELIVERY' ? 'Pay on delivery' : 'Pay online'}
                              </span>
                              <span className='mt-1 block text-sm text-muted-foreground'>
                                {method === 'PAY_ON_DELIVERY' ? 'Pay when your order arrives.' : 'Pay securely with Paystack.'}
                              </span>
                            </span>
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
          </div>

          <aside className='panel h-fit p-6 lg:sticky lg:top-28'>
            <h2 className='text-lg font-semibold text-foreground'>Order summary</h2>
            <ul className='mt-6 space-y-4 border-b border-border pb-6'>
              {selectedProducts.map((item, index) => (
                <li
                  key={index}
                  className='flex items-center gap-4'>
                  <div className='relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg bg-muted'>
                    <Image
                      src={item.images[0]}
                      fill
                      sizes='56px'
                      alt='product image'
                      className='object-cover'
                    />
                    <span className='absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[0.6875rem] font-semibold tabular-nums text-background'>
                      {item.quantity}
                    </span>
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-foreground'>{(item as { name?: string }).name ?? item.products?.name}</p>
                    {item.variantId && item.color && <p className='mt-0.5 text-sm capitalize text-muted-foreground'>{item.color}</p>}
                  </div>
                  <p className='price text-sm text-foreground'>{formatCurrency(item.price)}</p>
                </li>
              ))}
            </ul>

            {cart && (
              <>
                <dl className='space-y-3 border-b border-border py-5'>
                  <div className='summary-row'>
                    <dt className='text-muted-foreground'>Subtotal</dt>
                    <dd className='price'>{formatCurrency(cart.itemsPrice)}</dd>
                  </div>
                  <div className='summary-row'>
                    <dt className='text-muted-foreground'>Delivery</dt>
                    <dd className='price'>{cart.shippingPrice > 0 ? formatCurrency(cart.shippingPrice) : 'Free'}</dd>
                  </div>
                </dl>
                <div className='summary-row pt-5'>
                  <span className='font-semibold text-foreground'>Total</span>
                  <span className='price text-xl font-semibold text-foreground'>{formatCurrency(cart.totalPrice)}</span>
                </div>
              </>
            )}

            <Button
              className='mt-6 h-12 w-full cursor-pointer rounded-full text-[0.9375rem] font-semibold'
              disabled={isPending}
              type='submit'>
              {isPending ? (
                <Spinner
                  className='size-4'
                  aria-hidden='true'
                />
              ) : (
                <LockIcon
                  className='size-4'
                  aria-hidden='true'
                />
              )}
              {isPending ? 'Placing order…' : 'Place order'}
            </Button>
            <p className='mt-4 text-center text-xs leading-relaxed text-muted-foreground'>
              Review your details and payment method before placing your order.
            </p>
          </aside>
        </div>
      </form>
    </Form>
  );
};
