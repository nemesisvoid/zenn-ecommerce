'use server';

import { getOrderById } from '@/actions/order.action';
import { auth } from '@/auth';
import { formatCurrency, renderProduct } from '@/helper/utils';
import { ArrowLeftIcon, CheckIcon, CreditCardIcon, LockIcon, MapPinIcon, PackageSearchIcon } from 'lucide-react';
import EmptyState from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const OrderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user.id)
    return (
      <div className='container'>
        <EmptyState
          icon={LockIcon}
          title='Sign in to view your order'
          description='Orders are only visible to the account that placed them.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/auth/login'>Sign in</Link>
          </Button>
        </EmptyState>
      </div>
    );

  const order = await getOrderById(id, session.user.id);

  const selectedProduct = order?.orderItems.map(item => {
    if (item.variantId) {
      const foundVariant = item.product.colorImages.find(ci => ci.color === item.variant?.color);
      return {
        productId: item.productId,
        color: foundVariant?.color,
        size: item.variant?.size,
        images: foundVariant?.images,
        price: item.variant?.price,
        name: item.product?.name,
        variantId: item.variant?.id,
        quantity: item.quantity,
      };
    } else {
      return {
        productId: item.productId,
        name: item.product?.name,
        images: item.product?.images,
        price: item.product?.price,
        quantity: item.quantity,
      };
    }
  });
  if (!order)
    return (
      <div className='container'>
        <EmptyState
          icon={PackageSearchIcon}
          title='Order not found'
          description='We couldn’t find this order on your account.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/'>
              <ArrowLeftIcon
                className='size-4'
                aria-hidden='true'
              />
              Back to home
            </Link>
          </Button>
        </EmptyState>
      </div>
    );

  const isPayOnDelivery = order.paymentMethod === 'PAY_ON_DELIVERY';
  return (
    <div className='container'>
      <div className='mx-auto max-w-2xl'>
        <header className='flex flex-col items-center text-center'>
          <span className='flex size-14 items-center justify-center rounded-full bg-success/12 text-success'>
            <CheckIcon
              className='size-7'
              aria-hidden='true'
            />
          </span>
          <h1 className='page-title mt-6'>Thank you for your order</h1>
          <p className='lede mt-3 max-w-md'>
            {isPayOnDelivery ? 'Your order is confirmed. You’ll pay when it arrives.' : 'Your payment was successful and your order is confirmed.'} A receipt
            has been sent to <span className='font-medium text-foreground'>{order.email}</span>.
          </p>
          {order.paystackReference && (
            <p className='mt-4 rounded-full bg-secondary px-4 py-1.5 text-sm text-muted-foreground'>
              Reference <span className='font-medium tabular-nums text-foreground'>{order.paystackReference}</span>
            </p>
          )}
        </header>

        <div className='panel mt-10 overflow-hidden'>
          <dl className='grid gap-6 border-b border-border p-6 sm:grid-cols-2 md:p-8'>
            <div>
              <dt className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MapPinIcon
                  className='size-4'
                  aria-hidden='true'
                />
                Delivery address
              </dt>
              <dd className='mt-2 text-[0.9375rem] text-foreground'>{order.shippingAddress}</dd>
            </div>
            <div>
              <dt className='flex items-center gap-2 text-sm text-muted-foreground'>
                <CreditCardIcon
                  className='size-4'
                  aria-hidden='true'
                />
                Payment method
              </dt>
              <dd className='mt-2 text-[0.9375rem] capitalize text-foreground'>
                {isPayOnDelivery ? order.paymentMethod.split('_').join(' ').toLowerCase() : order.paymentMethod.toLowerCase()}
              </dd>
            </div>
          </dl>

          <div className='p-6 md:p-8'>
            <h2 className='text-sm font-semibold text-foreground'>Items</h2>
            <ul className='mt-4 divide-y divide-border'>
              {selectedProduct?.map((item, i) => (
                <li
                  key={i}
                  className='flex items-center gap-4 py-4 first:pt-0'>
                  <div className='relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
                    <Image
                      src={item.images[0] || ''}
                      alt='order item'
                      fill
                      sizes='64px'
                      className='object-cover'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-[0.9375rem] font-medium text-foreground'>{item.name}</p>
                    <p className='mt-1 text-sm capitalize text-muted-foreground'>
                      {[item.color, item.size, `Qty ${item.quantity}`].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {item.price != null && <p className='price text-sm text-foreground'>{formatCurrency(item.price)}</p>}
                </li>
              ))}
            </ul>
          </div>

          <div className='summary-row border-t border-border bg-secondary/60 px-6 py-5 md:px-8'>
            <span className='font-semibold text-foreground'>Total</span>
            <span className='price text-xl font-semibold text-foreground'>{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        <div className='mt-8 flex flex-wrap justify-center gap-3'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
