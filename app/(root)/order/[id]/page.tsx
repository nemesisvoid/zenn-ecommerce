'use server';

import { getOrderById } from '@/actions/order.action';
import { auth } from '@/auth';
import { formatCurrency } from '@/helper/utils';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const OrderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user.id) return <div>Please login to view your order.</div>;

  const order = await getOrderById(id, session.user.id);
  if (!order)
    return (
      <div
        className='flex
       flex-col items-center gap-3 my-20'>
        <p className='text-xl font-medium'>Order not found🤔</p>

        <Link
          href='/'
          className='flex items-center gap-2'>
          <ArrowLeftIcon size={18} />
          Back to home
        </Link>
      </div>
    );

  return (
    <div className='container text-center mt-10 h-screen'>
      <div className='bg-gray-100 p-10 lg:w-1/2 mx-auto rounded-lg'>
        <div className='border-b border-gray-300 mb-5 pb-4'>
          <h2 className='text-gray-500 text-sm font-medium'>Thank you</h2>
          <h1 className='text-2xl font-semibold mb-4'>🎉 Payment Successful!</h1>
          <p className=''>
            Your order <strong>{order.paystackReference}</strong> has been confirmed.
          </p>
          {/* <p className='text-sm mt-3'>
            We have sent your order receipt to <strong>{order.email}</strong>.
          </p> */}
        </div>

        <div className='flex justify-around items-center border-b border-gray-300 mb-5 pb-4'>
          <div>
            <h4 className='text-gray-500 font-medium mb-2'>Shipping address</h4>
            <p>{order.shippingAddress}</p>
          </div>
          <div>
            <h4 className='text-gray-500 font-medium mb-2'>Payment Method</h4>
            <p>{order.paymentMethod}</p>
          </div>
        </div>

        <div>
          <h4 className='text-left mb-4'>Order Items</h4>
          {order.orderItems.map(item => (
            <div key={item.id}>
              <div className='flex gap-3 border-b border-gray-300 mb-4 pb-4'>
                <div
                  className='relative aspect-square w-20 h-20
                '>
                  <Image
                    src={item.variant?.images[0] || item.product.images[0] || ''}
                    alt='order item'
                    fill
                    className='rounded-lg object-cover'
                  />
                </div>
                <div className='grid grid-cols-1'>
                  <p>{item.product.name}</p>
                  <div className='flex flex-col text-left text-wrap mt-auto'>
                    {item.variant && <p className='text-sm text-gray-500 mb-1'>{item.variant.color}</p>}
                    <p className='text-sm text-gray-500'>x{item.quantity}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className='text-left mb-4'>Subtotal</h4>
          <div className='flex justify-between'>
            <h5>Total</h5>
            <p>{formatCurrency(order.totalPrice)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
