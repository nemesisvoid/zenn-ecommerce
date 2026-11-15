'use server';

import { getOrderById } from '@/actions/order.action';
import { auth } from '@/auth';
import { formatCurrency } from '@/helper/utils';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  LockIcon,
  MapPinIcon,
  PackageSearchIcon,
  RotateCcwIcon,
  TruckIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/shared/empty-state';
import OrderStatusPill from '@/components/shared/order-status-pill';
import RefundSection from '@/components/order/refund-section';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { loginUrlFor } from '@/routes';

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
            <Link href={loginUrlFor(`/order/${id}`)}>Sign in</Link>
          </Button>
        </EmptyState>
      </div>
    );

  const order = await getOrderById(id);

  // item.price is the unit price actually charged when the order was placed.
  const selectedProduct = order?.orderItems.map(item => {
    const colorImages = item.variant ? item.product.colorImages.find(ci => ci.color === item.variant?.color)?.images : undefined;
    return {
      productId: item.productId,
      name: item.product.name,
      color: item.variant?.color,
      size: item.variant?.size,
      images: colorImages?.length ? colorImages : item.product.images,
      price: item.price,
      quantity: item.quantity,
    };
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

  const header = (() => {
    if (order.status === 'CANCELLED')
      return { icon: XIcon, tone: 'bg-destructive/10 text-destructive', title: 'This order was cancelled', message: 'This order has been cancelled.' };
    switch (order.paymentStatus) {
      case 'PAID':
        return {
          icon: CheckIcon,
          tone: 'bg-success/12 text-success',
          title: 'Thank you for your order',
          message: 'Your payment was successful and your order is confirmed.',
        };
      case 'FAILED':
        return {
          icon: XIcon,
          tone: 'bg-destructive/10 text-destructive',
          title: 'Payment failed',
          message: 'Your payment didn’t go through, so this order hasn’t been confirmed.',
        };
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return {
          icon: RotateCcwIcon,
          tone: 'bg-secondary text-muted-foreground',
          title: order.paymentStatus === 'REFUNDED' ? 'This order was refunded' : 'This order was partially refunded',
          message: 'Your refund has been issued to your original payment method.',
        };
      default:
        return isPayOnDelivery
          ? { icon: CheckIcon, tone: 'bg-success/12 text-success', title: 'Thank you for your order', message: 'Your order is confirmed. You’ll pay when it arrives.' }
          : {
              icon: ClockIcon,
              tone: 'bg-brand-soft text-brand-ink',
              title: 'Waiting for payment',
              message: 'We haven’t received your payment yet. If you just paid, it can take a few minutes to update.',
            };
    }
  })();
  const HeaderIcon = header.icon;

  return (
    <div className='container'>
      <div className='mx-auto max-w-2xl'>
        <header className='flex flex-col items-center text-center'>
          <span className={cn('flex size-14 items-center justify-center rounded-full', header.tone)}>
            <HeaderIcon
              className='size-7'
              aria-hidden='true'
            />
          </span>
          <h1 className='page-title mt-6'>{header.title}</h1>
          <p className='lede mt-3 max-w-md'>
            {header.message}
            {order.paymentStatus === 'PAID' && (
              <>
                {' '}
                A receipt has been sent to <span className='font-medium text-foreground'>{order.email}</span>.
              </>
            )}
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
            <div>
              <dt className='flex items-center gap-2 text-sm text-muted-foreground'>
                <WalletIcon
                  className='size-4'
                  aria-hidden='true'
                />
                Payment status
              </dt>
              <dd className='mt-2'>
                <OrderStatusPill status={order.paymentStatus} />
              </dd>
            </div>
            <div>
              <dt className='flex items-center gap-2 text-sm text-muted-foreground'>
                <TruckIcon
                  className='size-4'
                  aria-hidden='true'
                />
                Delivery status
              </dt>
              <dd className='mt-2 flex flex-wrap gap-2'>
                <OrderStatusPill status={order.deliveryStatus} />
                {order.status === 'CANCELLED' && <OrderStatusPill status='CANCELLED' />}
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
                      src={item.images?.[0] || ''}
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
                  <p className='price text-sm text-foreground'>{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>

          <dl className='space-y-3 border-t border-border px-6 py-5 text-sm md:px-8'>
            <div className='summary-row'>
              <dt className='text-muted-foreground'>Subtotal</dt>
              <dd className='price text-foreground'>{formatCurrency(order.itemsPrice)}</dd>
            </div>
            <div className='summary-row'>
              <dt className='text-muted-foreground'>Delivery</dt>
              <dd className='price text-foreground'>{order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'Free'}</dd>
            </div>
            {!!order.taxPrice && order.taxPrice > 0 && (
              <div className='summary-row'>
                <dt className='text-muted-foreground'>Tax</dt>
                <dd className='price text-foreground'>{formatCurrency(order.taxPrice)}</dd>
              </div>
            )}
          </dl>

          <div className='summary-row border-t border-border bg-secondary/60 px-6 py-5 md:px-8'>
            <span className='font-semibold text-foreground'>Total</span>
            <span className='price text-xl font-semibold text-foreground'>{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        <RefundSection
          order={order}
          requests={order.refundRequests}
        />

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
