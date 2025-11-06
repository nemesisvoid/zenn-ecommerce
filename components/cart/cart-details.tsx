'use client';

import Image from 'next/image';

import { Button } from '../ui/button';
import { ArrowRight, LoaderIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { CartItemType, CartType } from '@/types';
import { createCart, removeCartItem } from '@/actions/cart.actions';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/helper/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CartDetailsProps = {
  cart: CartType | undefined;
  cartItems: CartItemType[] | undefined;
  cartItemsCount?: number;
};
const CartDetails = ({ cart, cartItems }: CartDetailsProps) => {
  const router = useRouter();
  // console.log('var', cartItems.variants);
  // console.log('itemVariant', itemVariant);
  // cartItems?.map(item => item.variants?.map(v => v.images));
  const [isPending, startTransition] = useTransition();
  console.log('cartItems', cartItems);
  return (
    <div>
      <h2 className='text-xl md:text-3xl font-medium mb-10'>Cart</h2>
      <div className='flex justify-between mt-1'>
        <div className='border border-gray-300 rounded-xl p-4'>
          <div className='flex flex-col gap-14'>
            {cartItems?.map(item => (
              <div
                key={item.id}
                className='flex gap-2
                  '>
                {item.variants &&
                  item.variants?.images.slice(1, 2).map((img, index) => (
                    <div
                      key={index}
                      className='relative w-25 aspect-square'>
                      <Image
                        src={img}
                        className='object-cover rounded-sm'
                        fill
                        alt='product image'
                      />
                    </div>
                  ))}

                <div className='flex flex-col justify-between ml-2'>
                  <p className='text-lg font-medium'>{item.products?.name}</p>

                  <p className='text-base font-semibold'>{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className='flex flex-col justify-between items-end'>
                  <Button className='text-red-400 bg-transparent size-7 rounded-sm cursor-pointer'>
                    <Trash2Icon />
                  </Button>

                  <div className='bg-gray-300 rounded-full flex items-center gap-5 px-2 py-1 ml-6'>
                    <button
                      className='text-sm rounded-sm cursor-pointer'
                      disabled={isPending}
                      onClick={() => {
                        startTransition(async () => {
                          const res = await createCart(item);
                          console.log('id matched');
                          if (!res?.success) {
                            toast.error(res?.message);
                          }

                          router.refresh();
                        });
                      }}>
                      {isPending ? <LoaderIcon className='animate-spin' /> : <PlusIcon size={18} />}
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
                      <MinusIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='w-1/3 border border-gray-300 rounded-xl p-4'>
          <h3 className='text-xl font-medium mb-4'>Order Summary</h3>

          <div className='flex flex-col gap-4 border-b border-gray-400 pb-2'>
            <div className='flex justify-between'>
              <p className='text-base text-gray-500'>Subtotal</p>

              <p>{cart?.itemsPrice}</p>
            </div>
            <div className='flex justify-between pb-2'>
              <p className='text-base text-gray-500'>Delivery fee</p>

              <p>{cart?.shippingPrice > 0 ? formatCurrency(cart?.shippingPrice) : 'Free'}</p>
            </div>
          </div>

          <div className='pt-2 mb-10'>
            <div className='flex justify-between'>
              <p className='text-base text-gray-500'>Total Price</p>

              <p>{cart && formatCurrency(cart?.totalPrice)}</p>
            </div>
          </div>

          <Button
            className='text-xl font-base text-white bg-black rounded-4xl py-7 w-full'
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
