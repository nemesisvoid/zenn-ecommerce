'use client';

import Image from 'next/image';

import { Button } from '../ui/button';
import { ArrowRight, LoaderIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { CartItemType, CartType } from '@/types';
import { createCart, removeCartItem } from '@/actions/cart.actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { formatCurrency, renderProduct, RenderedCartItem } from '@/helper/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartDetailsProps = {
  cart: CartType | undefined;
  cartItems: CartItemType[] | undefined;
  cartItemsCount?: number;
};
const CartDetails = ({ cart }: CartDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedProduct: RenderedCartItem[] = renderProduct(cart?.cartItems ?? []);
  console.log('selected', selectedProduct);

  return (
    <div className='mb-10 md:mb-20'>
      <h2 className='text-xl md:text-3xl font-medium mb-10'>Cart</h2>
      <div className='flex flex-col md:flex-row justify-between gap-10 mt-1'>
        <div className='border border-gray-300 rounded-xl p-4 flex-1'>
          <div className='flex flex-col gap-14'>
            {selectedProduct?.map((item, index) => {
              const unitPrice = item.discountPrice || item.price;
              const totalPrice = unitPrice * item.quantity;
              return (
                <div
                  key={index}
                  className='flex gap-2
                  '>
                  {item?.images?.slice(0, 1).map(img => (
                    <div
                      key={img}
                      className='relative w-25 aspect-square'>
                      <Image
                        src={img}
                        className='object-cover rounded-sm'
                        fill
                        alt='product image'
                      />
                    </div>
                  ))}
                  <div className='flex flex-col justify-between ml-2 flex-1'>
                    <p className='text-lg font-medium'>{item?.name}</p>

                    <p className='text-base font-semibold'>
                      {item.discountPrice ? (
                        <>
                          <span className='text-sm line-through text-gray-500 mr-2'>{formatCurrency(item.price * item.quantity)}</span>
                          <span>{formatCurrency(totalPrice)}</span>
                        </>
                      ) : (
                        <span>{formatCurrency(totalPrice)}</span>
                      )}
                    </p>

                    <p>
                      {item?.color}
                      <span className='text-gray-400'> x {item.quantity}</span>
                    </p>
                  </div>

                  <div className='flex flex-col justify-between items-end'>
                    <Button className='text-red-400 bg-transparent size-7 rounded-sm cursor-pointer'>
                      <Trash2Icon />
                    </Button>

                    <div className='bg-gray-300 rounded-full flex items-center gap-5 px-2 py-1 ml-6 dark:bg-white'>
                      <button
                        className='text-sm rounded-sm cursor-pointer'
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await createCart({
                              productId: item.productId ?? '',
                              variantId: item.variantId ?? null,
                              price: item.price,
                              quantity: 1,
                              discountPrice: item.discountPrice ?? null,
                            });
                            if (!res?.success) {
                              toast.error(res?.message);
                            }

                            router.refresh();
                          });
                        }}>
                        {isPending ? (
                          <LoaderIcon className='animate-spin text-black' />
                        ) : (
                          <PlusIcon
                            size={18}
                            className='dark:text-black'
                          />
                        )}
                      </button>
                      <p className='text-base text-gray-800'>{item.quantity}</p>
                      <button
                        className='text-sm rounded-sm cursor-pointer'
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await removeCartItem(item.productId, item?.variantId);
                            if (!res?.success) {
                              toast.error(res?.message || 'Something went wrong');
                            }
                            toast.success(res?.message);
                            router.refresh();
                          });
                        }}>
                        <MinusIcon
                          size={18}
                          className='dark:text-black'
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='lg:w-[36%] flex flex-col border border-gray-300 rounded-xl p-4'>
          <h3 className='text-xl font-medium mb-4'>Order Summary</h3>

          <div className='flex flex-col gap-4 border-b border-gray-400 pb-2'>
            <div className='flex justify-between'>
              <p className='text-base text-gray-500'>Subtotal</p>

              <p>{formatCurrency(cart?.itemsPrice)}</p>
            </div>
            <div className='flex justify-between pb-2'>
              <p className='text-base text-gray-500'>Delivery fee</p>

              <p>{cart && cart.shippingPrice > 0 ? formatCurrency(cart?.shippingPrice) : 'Free'}</p>
            </div>
          </div>

          <div className='pt-2 mb-10'>
            <div className='flex justify-between'>
              <p className='text-base text-gray-500'>Total Price</p>

              <p>{cart && formatCurrency(cart?.totalPrice)}</p>
            </div>
          </div>

          <Button
            className='text-xl font-base text-white bg-black rounded-4xl py-7 w-full mt-auto dark:text-black dark:bg-white dark:hover:bg-black dark:hover:text-white hover:bg-white hover:text-black transition-colors duration-500'
            asChild>
            <Link
              href='/checkout'
              className='flex items-center gap-4'>
              Proceed to Checkout <ArrowRight className='size-6' />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
