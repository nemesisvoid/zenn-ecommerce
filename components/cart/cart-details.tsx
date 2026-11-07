'use client';

import Image from 'next/image';

import { Button } from '../ui/button';
import { LockIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Spinner from '@/components/shared/spinner';

import { CartType } from '@/types';
import { createCart, deleteCartItem, removeCartItem } from '@/actions/cart.actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { formatCurrency, renderProduct, RenderedCartItem } from '@/helper/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartDetailsProps = {
  cart: CartType;
};
const CartDetails = ({ cart }: CartDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedProduct: RenderedCartItem[] = renderProduct(cart.cartItems);

  const itemCount = selectedProduct.reduce((total, item) => total + (item.quantity ?? 0), 0);

  return (
    <div>
      <header className='mb-8 flex items-end justify-between gap-4 md:mb-10'>
        <h1 className='page-title'>Your bag</h1>
        <p className='pb-1 text-sm tabular-nums text-muted-foreground'>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </header>
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10'>
        <ul className='panel divide-y divide-border px-4 md:px-6'>
          {selectedProduct?.map((item, index) => {
            const unitPrice = item.discountPrice ?? item.price;
            const totalPrice = unitPrice * item.quantity;
            return (
              <li
                key={index}
                className='flex gap-4 py-5 md:gap-5 md:py-6'>
                {item?.images?.slice(0, 1).map(img => (
                  <div
                    key={img}
                    className='relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-muted md:w-24'>
                    <Image
                      src={img}
                      className='object-cover'
                      fill
                      sizes='96px'
                      alt='product image'
                    />
                  </div>
                ))}
                <div className='flex min-w-0 flex-1 flex-col'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='truncate text-[0.9375rem] font-medium text-foreground'>{item?.name}</p>
                      {(item?.color || item?.size) && (
                        <p className='mt-1 text-sm capitalize text-muted-foreground'>{[item?.color, item?.size].filter(Boolean).join(' / ')}</p>
                      )}
                    </div>
                    <Button
                      variant='ghost'
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const res = await deleteCartItem(item.productId, item.variantId);
                          if (!res.success) {
                            toast.error(res.message);
                            return;
                          }
                          toast.success(res.message);
                          router.refresh();
                        });
                      }}
                      aria-label={`Remove ${item?.name ?? 'item'}`}
                      className='-mr-2 -mt-1 size-9 shrink-0 cursor-pointer rounded-full text-muted-foreground hover:bg-accent hover:text-destructive'>
                      <Trash2Icon className='size-4' />
                    </Button>
                  </div>

                  <div className='mt-auto flex items-end justify-between gap-3 pt-4'>
                    <div
                      className='flex h-10 items-center rounded-full border border-input bg-card'
                      role='group'
                      aria-label='Quantity'>
                      <button
                        type='button'
                        aria-label='Decrease quantity'
                        className='flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await removeCartItem(item.productId, item?.variantId);
                            if (!res?.success) {
                              toast.error(res?.message || 'Something went wrong');
                              return;
                            }
                            toast.success(res?.message);
                            router.refresh();
                          });
                        }}>
                        <MinusIcon className='size-4' />
                      </button>
                      <span
                        className='min-w-6 text-center text-sm font-medium tabular-nums text-foreground'
                        aria-live='polite'>
                        {isPending ? (
                          <Spinner
                            className='mx-auto size-4 text-muted-foreground'
                            aria-label='Updating'
                          />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        type='button'
                        aria-label='Increase quantity'
                        className='flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await createCart({
                              productId: item.productId,
                              variantId: item.variantId ?? null,
                            });
                            if (!res?.success) {
                              toast.error(res?.message);
                            }

                            router.refresh();
                          });
                        }}>
                        <PlusIcon className='size-4' />
                      </button>
                    </div>

                    <div className='text-right'>
                      {item.discountPrice != null ? (
                        <>
                          <p className='price text-xs text-muted-foreground line-through'>{formatCurrency(item.price * item.quantity)}</p>
                          <p className='price text-[0.9375rem] text-foreground'>{formatCurrency(totalPrice)}</p>
                        </>
                      ) : (
                        <p className='price text-[0.9375rem] text-foreground'>{formatCurrency(totalPrice)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className='panel h-fit p-6 lg:sticky lg:top-28'>
          <h2 className='text-lg font-semibold text-foreground'>Order summary</h2>

          <dl className='mt-6 space-y-3 border-b border-border pb-5'>
            <div className='summary-row'>
              <dt className='text-muted-foreground'>Subtotal</dt>
              <dd className='price'>{formatCurrency(cart?.itemsPrice)}</dd>
            </div>
            <div className='summary-row'>
              <dt className='text-muted-foreground'>Delivery</dt>
              <dd className='price'>{cart && cart.shippingPrice > 0 ? formatCurrency(cart?.shippingPrice) : 'Free'}</dd>
            </div>
          </dl>

          <div className='summary-row pt-5'>
            <span className='font-semibold text-foreground'>Total</span>
            <span className='price text-xl font-semibold text-foreground'>{cart && formatCurrency(cart?.totalPrice)}</span>
          </div>

          <Button
            className='mt-6 h-12 w-full rounded-full text-[0.9375rem] font-semibold'
            asChild>
            <Link href='/checkout'>
              <LockIcon
                className='size-4'
                aria-hidden='true'
              />
              Checkout securely
            </Link>
          </Button>
          <Link
            href='/list'
            className='mt-4 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground'>
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartDetails;
