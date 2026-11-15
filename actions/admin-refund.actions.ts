'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import type { Prisma } from '@prisma/client';

import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { incrementStock } from '@/lib/cart';
import {
  applyPaystackRefundStatus,
  completeRefund,
  createPaystackRefund,
  fetchPaystackRefund,
  refundReferenceFor,
  type RefundItemSnapshot,
} from '@/lib/refunds';
import { sendOrderEmail } from '@/helper/order-emails';
import { formatCurrency } from '@/helper/utils';
import { logActivity } from './activity.action';

type Result = { success: boolean; message: string };

const revalidate = (orderId: string) => {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath(`/order/${orderId}`);
};

const log = (orderId: string, details: Record<string, { old: Prisma.InputJsonValue | null; new: Prisma.InputJsonValue | null }>) =>
  logActivity({ action: 'UPDATE', entity: 'ORDER', entityId: orderId, entityName: `Order #${orderId.slice(0, 8).toUpperCase()}`, details });

const loadRequest = (id: string) => prisma.refundRequest.findUnique({ where: { id }, include: { order: true } });

/** Approve the return: the customer is emailed the return instructions. */
export const approveRefundRequest = async (id: string, message: string): Promise<Result> => {
  try {
    await requireAdmin();
    const instructions = message.trim();
    if (instructions.length < 5) return { success: false, message: 'Add return instructions for the customer' };

    const request = await loadRequest(id);
    if (!request) return { success: false, message: 'Request not found' };
    if (request.status !== 'REQUESTED') return { success: false, message: 'This request has already been handled' };

    await prisma.refundRequest.update({ where: { id }, data: { status: 'APPROVED', adminMessage: instructions, approvedAt: new Date() } });
    await log(request.orderId, { refundRequest: { old: 'Requested', new: 'Approved (awaiting return)' } });
    revalidate(request.orderId);
    after(() => sendOrderEmail(request.orderId, 'refund_approved', { note: instructions }));
    return { success: true, message: 'Approved. The customer has been sent the return instructions.' };
  } catch (error) {
    console.error('error approving refund request', error);
    return { success: false, message: 'Could not approve the request' };
  }
};

export const rejectRefundRequest = async (id: string, message: string): Promise<Result> => {
  try {
    await requireAdmin();
    const reason = message.trim();
    if (reason.length < 5) return { success: false, message: 'Tell the customer why the request was declined' };

    const request = await loadRequest(id);
    if (!request) return { success: false, message: 'Request not found' };
    if (request.status !== 'REQUESTED' && request.status !== 'APPROVED') return { success: false, message: 'This request can no longer be declined' };

    await prisma.refundRequest.update({ where: { id }, data: { status: 'REJECTED', adminMessage: reason } });
    await log(request.orderId, { refundRequest: { old: request.status === 'REQUESTED' ? 'Requested' : 'Approved', new: 'Declined' } });
    revalidate(request.orderId);
    after(() => sendOrderEmail(request.orderId, 'refund_rejected', { note: reason }));
    return { success: true, message: 'Request declined. The customer has been emailed.' };
  } catch (error) {
    console.error('error rejecting refund request', error);
    return { success: false, message: 'Could not decline the request' };
  }
};

/** The returned items have arrived. Optionally put them back into stock. */
export const markRefundItemsReceived = async (id: string, restock: boolean): Promise<Result> => {
  try {
    await requireAdmin();
    const request = await loadRequest(id);
    if (!request) return { success: false, message: 'Request not found' };
    if (request.status !== 'APPROVED') return { success: false, message: 'Approve the request before marking items received' };

    const items = request.items as RefundItemSnapshot[];
    await prisma.$transaction(async tx => {
      await tx.refundRequest.update({ where: { id }, data: { status: 'RECEIVED', receivedAt: new Date(), restocked: restock } });
      if (restock) {
        const lines = await tx.orderItem.findMany({ where: { id: { in: items.map(i => i.orderItemId) } } });
        await incrementStock(
          tx,
          items.flatMap(i => {
            const line = lines.find(l => l.id === i.orderItemId);
            return line ? [{ productId: line.productId, variantId: line.variantId, quantity: i.quantity }] : [];
          }),
        );
      }
    });

    await log(request.orderId, { refundRequest: { old: 'Approved', new: `Items received${restock ? ', returned to stock' : ''}` } });
    revalidate(request.orderId);
    return { success: true, message: 'Items marked as received' };
  } catch (error) {
    console.error('error marking refund items received', error);
    return { success: false, message: 'Could not update the request' };
  }
};

const checkAmount = (amount: number, max: number) => Number.isFinite(amount) && amount > 0 && amount <= max + 0.01;

/** What is left to refund on an order after earlier completed refunds. */
const remainingRefundable = async (orderId: string, orderTotal: number) => {
  const refunded = await prisma.refundRequest.aggregate({ where: { orderId, status: 'REFUNDED' }, _sum: { refundedAmount: true } });
  return orderTotal - (refunded._sum.refundedAmount ?? 0);
};

/**
 * Paystack reference for this attempt. The first attempt uses the request's base reference; a retry
 * after a failure uses the next numbered one. Deterministic, so a double-click reuses the same refund.
 */
const nextRefundReference = (requestId: string, previous: string | null) => {
  const base = refundReferenceFor(requestId);
  if (!previous) return base;
  const attempt = previous === base ? 1 : Number(previous.split('_').pop()) || 1;
  return `${base}_${attempt + 1}`;
};

/** Paystack orders: send the money back through Paystack. */
export const issuePaystackRefund = async (id: string, amount: number): Promise<Result> => {
  try {
    await requireAdmin();
    const request = await loadRequest(id);
    if (!request) return { success: false, message: 'Request not found' };
    if (request.order.paymentMethod !== 'PAYSTACK' || !request.order.paystackReference) {
      return { success: false, message: 'This order was not paid online. Send a bank transfer and mark it as sent.' };
    }
    if (request.status !== 'RECEIVED' && request.status !== 'FAILED') return { success: false, message: 'Mark the items as received first' };

    // Never refund more than what's left of the order total.
    const remaining = await remainingRefundable(request.orderId, request.order.totalPrice);
    if (!checkAmount(amount, remaining)) return { success: false, message: `Enter an amount between ₦1 and ${formatCurrency(remaining)}` };

    const reference = request.status === 'FAILED' ? nextRefundReference(request.id, request.paystackRefundRef) : refundReferenceFor(request.id);
    const result = await createPaystackRefund({
      transactionReference: request.order.paystackReference,
      amountKobo: Math.round(amount * 100),
      reference,
      customerNote: `Refund for order #${request.orderId.slice(0, 8).toUpperCase()}`,
    });
    if (!result.ok) return { success: false, message: `Paystack: ${result.message}` };

    await prisma.refundRequest.update({
      where: { id },
      data: { status: 'REFUNDING', refundedAmount: amount, paystackRefundRef: reference, paystackRefundId: String(result.refund.id) },
    });
    await log(request.orderId, { refundRequest: { old: 'Items received', new: `Refund of ${formatCurrency(amount)} sent to Paystack` } });

    // Occasionally Paystack completes immediately.
    if (result.refund.status === 'processed') await completeRefund(id, ['REFUNDING']);
    revalidate(request.orderId);
    return { success: true, message: 'Refund sent to Paystack. It usually completes within a few days; the customer is emailed when it does.' };
  } catch (error) {
    console.error('error issuing paystack refund', error);
    return { success: false, message: 'Could not reach Paystack. Try again shortly.' };
  }
};

/** Pay-on-delivery orders: the admin sent a bank transfer to the customer's account. */
export const markRefundTransferred = async (id: string, amount: number): Promise<Result> => {
  try {
    await requireAdmin();
    const request = await loadRequest(id);
    if (!request) return { success: false, message: 'Request not found' };
    if (request.status !== 'RECEIVED') return { success: false, message: 'Mark the items as received first' };
    const remaining = await remainingRefundable(request.orderId, request.order.totalPrice);
    if (!checkAmount(amount, remaining)) return { success: false, message: `Enter an amount between ₦1 and ${formatCurrency(remaining)}` };

    await prisma.refundRequest.update({ where: { id }, data: { refundedAmount: amount } });
    await completeRefund(id, ['RECEIVED']);
    await log(request.orderId, { refundRequest: { old: 'Items received', new: `Refunded ${formatCurrency(amount)} by bank transfer` } });
    revalidate(request.orderId);
    return { success: true, message: 'Refund recorded. The customer has been emailed.' };
  } catch (error) {
    console.error('error recording transfer refund', error);
    return { success: false, message: 'Could not record the refund' };
  }
};

/** Asks Paystack for the latest state of a refund (useful when webhooks aren't set up, e.g. locally). */
export const checkPaystackRefundStatus = async (id: string): Promise<Result> => {
  try {
    await requireAdmin();
    const request = await loadRequest(id);
    if (!request?.paystackRefundRef) return { success: false, message: 'No Paystack refund for this request' };

    const refund = await fetchPaystackRefund(request.paystackRefundRef);
    if (!refund) return { success: false, message: 'Paystack has no record of this refund yet' };

    await applyPaystackRefundStatus(id, refund.status);
    if (refund.status === 'processed') await log(request.orderId, { refundRequest: { old: 'Refunding', new: 'Refunded' } });
    revalidate(request.orderId);
    const labels: Record<string, string> = {
      processed: 'Refund completed',
      failed: 'Paystack could not complete the refund. You can try again.',
      'needs-attention': 'Paystack needs you to act on this refund in your Paystack dashboard.',
    };
    return { success: refund.status !== 'failed', message: labels[refund.status] ?? `Paystack says the refund is ${refund.status}` };
  } catch (error) {
    console.error('error checking refund status', error);
    return { success: false, message: 'Could not reach Paystack. Try again shortly.' };
  }
};
