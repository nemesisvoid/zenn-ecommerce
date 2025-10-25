'use server';

import { getOrderById } from '@/actions/order.action';
import { auth } from '@/auth';

const OrderPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const session = await auth();
  if (!session?.user.id) return <div>Please login to view your order.</div>;

  const order = await getOrderById(id, session.user.id);

  if (!order) return <div>Order not found.</div>;
  return (
    <div className='container'>
      <h1 className='text-2xl font-semibold mb-4'>🎉 Payment Successful!</h1>
      <p>
        Your order <strong>{order.paystackReference}</strong> has been confirmed.
      </p>
      <p>
        We’ve sent a receipt to <strong>{order.email}</strong>.
      </p>
    </div>
  );
};

export default OrderPage;
