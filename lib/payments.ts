// Shared Paystack handling for the checkout-complete page (verifyPayment) and the webhook.
// Not a 'use server' module, so none of this is callable directly from the browser.
import { revalidatePath } from 'next/cache';
import { sendMail } from '@/helper/send-mail';
import { receiptEmailHtml } from '@/helper/utils';
import { decrementStock } from '@/lib/cart';
import { prisma } from '@/lib/prisma';

/** The fields we use from a Paystack transaction (verify response `data`, or webhook `event.data`). */
export type PaystackTransaction = {
  reference: string;
  status: string;
  amount: number; // kobo
  currency: string;
};

export type PaymentResult =
  | { ok: true; orderId: string; alreadyPaid: boolean }
  | { ok: false; orderId?: string; reason: 'not_found' | 'not_successful' | 'amount_mismatch' | 'cancelled'; message: string };

/** Looks a transaction up directly with Paystack (used when the customer returns from checkout). */
export const fetchPaystackTransaction = async (reference: string): Promise<PaystackTransaction | null> => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack secret key is not configured');

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
  });
  const body = await res.json();
  if (!res.ok || !body.status) return null;
  return body.data as PaystackTransaction;
};

/**
 * Applies a Paystack transaction to its order. Safe to call more than once and from both the
 * webhook and the checkout page: only the first successful call marks the order paid, takes
 * stock, clears the cart and sends the receipt.
 */
export const applyPaystackPayment = async (tx: PaystackTransaction): Promise<PaymentResult> => {
  const order = await prisma.order.findUnique({
    where: { paystackReference: tx.reference },
    select: { id: true, totalPrice: true, paymentStatus: true, cartId: true, status: true },
  });
  if (!order) return { ok: false, reason: 'not_found', message: 'Order not found' };
  if (order.paymentStatus === 'PAID') return { ok: true, orderId: order.id, alreadyPaid: true };

  if (tx.status !== 'success') return { ok: false, orderId: order.id, reason: 'not_successful', message: 'Payment not successful' };

  const expectedKobo = Math.round(order.totalPrice * 100);
  if (tx.amount !== expectedKobo || tx.currency !== 'NGN') {
    console.error(`payment mismatch for order ${order.id}: paid ${tx.amount} ${tx.currency}, expected ${expectedKobo} NGN`);
    await prisma.order.updateMany({ where: { id: order.id, paymentStatus: { not: 'PAID' } }, data: { paymentStatus: 'FAILED' } });
    return { ok: false, orderId: order.id, reason: 'amount_mismatch', message: 'Payment amount does not match the order total' };
  }

  // A cancelled order that gets paid anyway: record the payment truthfully, but don't take stock
  // or complete it. The admin needs to refund the customer.
  if (order.status === 'CANCELLED') {
    await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: { not: 'PAID' } },
      data: { paymentStatus: 'PAID', isPaid: true, paidAt: new Date() },
    });
    console.error(`order ${order.id} was paid after it was cancelled; refund the customer`);
    revalidatePath(`/admin/orders/${order.id}`);
    return { ok: false, orderId: order.id, reason: 'cancelled', message: 'This order was cancelled. Your payment will be refunded.' };
  }

  // Atomically claim the order: if another request already marked it paid, count is 0 and we stop.
  const claimed = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { not: 'PAID' } },
    data: { status: 'CONFIRMED', paymentStatus: 'PAID', deliveryStatus: 'PROCESSING', isPaid: true, paidAt: new Date() },
  });
  if (claimed.count === 0) return { ok: true, orderId: order.id, alreadyPaid: true };

  const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
  const short = await decrementStock(prisma, items);
  if (short.length > 0) {
    // The customer has already paid, so the order stands; flag it for the admin to resolve.
    console.error(`order ${order.id} paid but stock was insufficient for order items: ${short.join(', ')}`);
  }

  await prisma.cart.deleteMany({ where: { id: order.cartId } });

  try {
    const paidOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { orderItems: { include: { product: true, variant: true } } },
    });
    await sendMail({
      email: process.env.EMAIL_FROM || '',
      sendTo: `${paidOrder.email}, ${'samsonajibade40@gmail.com'}`,
      subject: `Payment Successful — Receipt for Order #${paidOrder.id}`,
      html: receiptEmailHtml(paidOrder),
    });
  } catch (err) {
    // A failed email must not undo or retry the payment.
    console.error(`receipt email failed for order ${order.id}`, err);
  }

  revalidatePath(`/order/${order.id}`);
  revalidatePath('/user/settings/orders');
  return { ok: true, orderId: order.id, alreadyPaid: false };
};
