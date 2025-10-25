'use server';

import { revalidatePath } from 'next/cache';

export const verifyPayment = async (reference: string) => {
  if (!reference) throw new Error('Missiing payment reference  required for payment verification');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack secret key is not configured');
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
    });

    const data = await res.json();
    console.log('data here', data);
    const paymentStatus = data.data.status;

    if (!res.ok) {
      throw new Error(`Paystack API error: ${res.status} ${res.statusText}`);
    }

    const order = await prisma?.order.findUnique({
      where: { paystackReference: reference },
    });

    console.log('order found during verification', order);

    if (!order) return { success: false, reason: 'Order not found', message: 'Order not found', paymentStatus };

    if (order.isPaid) return { success: true, message: 'Order already paid', order, paymentStatus };

    if (paymentStatus === 'success') {
      const updatedOrder = await prisma?.order.update({
        where: { paystackReference: reference },
        data: { status: 'PAID', paidAt: new Date() },
      });

      const items = await prisma?.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of items!) {
        try {
          await prisma?.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        } catch (err) {
          console.error('stock update failed', err);
        }
      }

      revalidatePath(`order/${order.id}`);
      return { success: true, message: 'Payment verified and order updated', order: updatedOrder, paymentStatus };
    }

    return { success: false, reason: 'Payment not successful', message: 'Payment not successful', paymentStatus };
  } catch (error) {
    console.error('Error verifying payment:', error);
  }
};
