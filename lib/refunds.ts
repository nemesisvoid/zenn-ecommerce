// Refund requests: eligibility rules, Paystack refund calls and completion.
// Not a 'use server' module, so nothing here is callable from the browser.
import { revalidatePath } from 'next/cache';
import type { Order, RefundRequest, RefundStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendOrderEmail } from '@/helper/order-emails';

export const REFUND_WINDOW_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

export const REFUND_REASONS = [
  'Damaged or defective',
  'Wrong item sent',
  'Not as described',
  "Doesn't fit",
  'Changed my mind',
  'Other',
] as const;

/** Requests in these states are still being handled; a customer can only have one at a time. */
export const OPEN_REFUND_STATUSES: RefundStatus[] = ['REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDING', 'FAILED'];

export type RefundItemSnapshot = { orderItemId: string; name: string; option: string | null; quantity: number; unitPrice: number };

type EligibilityOrder = Pick<Order, 'status' | 'deliveryStatus' | 'deliveredAt' | 'paymentStatus'>;

/** Whether a customer may open a refund request for this order right now, and if not, why. */
export const refundEligibility = (order: EligibilityOrder, requests: Pick<RefundRequest, 'status'>[], now = new Date()) => {
  const deadline = order.deliveredAt ? new Date(order.deliveredAt.getTime() + REFUND_WINDOW_DAYS * DAY) : null;

  if (requests.some(r => OPEN_REFUND_STATUSES.includes(r.status))) return { eligible: false as const, reason: 'open', deadline };
  if (order.status === 'CANCELLED') return { eligible: false as const, reason: 'cancelled', deadline };
  if (order.deliveryStatus !== 'DELIVERED' || !deadline) return { eligible: false as const, reason: 'not_delivered', deadline };
  if (order.paymentStatus !== 'PAID') return { eligible: false as const, reason: 'not_paid', deadline };
  if (now > deadline) return { eligible: false as const, reason: 'expired', deadline };
  return { eligible: true as const, reason: null, deadline };
};

// ---- Paystack refunds (POST /refund, GET /refund?reference=…)

const PAYSTACK = 'https://api.paystack.co';
const secret = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('Paystack secret key is not configured');
  return key;
};

/** Our refund reference: 8–64 letters, digits, "_" or "-". One per request, so retries can't refund twice. */
export const refundReferenceFor = (requestId: string) => `rf_${requestId.replace(/-/g, '')}`;

type PaystackRefund = { id: number | string; status: string; amount: number | string; reference?: string };

export const fetchPaystackRefund = async (reference: string): Promise<PaystackRefund | null> => {
  const res = await fetch(`${PAYSTACK}/refund?reference=${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status || !Array.isArray(body.data) || body.data.length === 0) return null;
  return body.data[0] as PaystackRefund;
};

/** Creates a refund on Paystack. If this reference was already used (409), returns that existing refund. */
export const createPaystackRefund = async (params: { transactionReference: string; amountKobo: number; reference: string; customerNote: string }) => {
  const res = await fetch(`${PAYSTACK}/refund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction: params.transactionReference,
      amount: params.amountKobo,
      currency: 'NGN',
      reference: params.reference,
      customer_note: params.customerNote,
      merchant_note: `Refund ${params.reference}`,
    }),
  });
  const body = await res.json().catch(() => null);

  if (res.status === 409) {
    const existing = await fetchPaystackRefund(params.reference);
    if (existing) return { ok: true as const, refund: existing };
  }
  if (!res.ok || !body?.status) return { ok: false as const, message: (body?.message as string) || 'Paystack could not create the refund' };
  return { ok: true as const, refund: body.data as PaystackRefund };
};

// ---- Completion (shared by the webhook, the admin "check status" button and manual transfers)

const revalidateRefundPages = (orderId: string) => {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath(`/order/${orderId}`);
  revalidatePath('/user/settings/orders');
};

/**
 * Marks a request refunded (only once, even if called repeatedly), updates the order's payment
 * status from the total refunded so far, and emails the customer.
 */
export const completeRefund = async (requestId: string, fromStatuses: RefundStatus[]) => {
  const claimed = await prisma.refundRequest.updateMany({
    where: { id: requestId, status: { in: fromStatuses } },
    data: { status: 'REFUNDED', refundedAt: new Date() },
  });
  if (claimed.count === 0) return false;

  const request = await prisma.refundRequest.findUniqueOrThrow({ where: { id: requestId }, include: { order: true } });
  const refunded = await prisma.refundRequest.aggregate({
    where: { orderId: request.orderId, status: 'REFUNDED' },
    _sum: { refundedAmount: true },
  });
  const totalRefunded = refunded._sum.refundedAmount ?? 0;
  const paymentStatus = totalRefunded >= request.order.totalPrice - 0.01 ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
  await prisma.order.update({ where: { id: request.orderId }, data: { paymentStatus } });

  revalidateRefundPages(request.orderId);
  await sendOrderEmail(request.orderId, paymentStatus === 'REFUNDED' ? 'refunded' : 'partially_refunded', {
    amount: request.refundedAmount ?? request.amount,
  });
  return true;
};

export const failRefund = async (requestId: string) => {
  const updated = await prisma.refundRequest.updateMany({ where: { id: requestId, status: 'REFUNDING' }, data: { status: 'FAILED' } });
  if (updated.count > 0) {
    const request = await prisma.refundRequest.findUnique({ where: { id: requestId }, select: { orderId: true } });
    if (request) revalidateRefundPages(request.orderId);
    console.error(`paystack refund failed for request ${requestId}`);
  }
};

/** Applies a Paystack refund status to a request that is being refunded. */
export const applyPaystackRefundStatus = async (requestId: string, status: string) => {
  if (status === 'processed') return completeRefund(requestId, ['REFUNDING', 'FAILED']);
  if (status === 'failed') {
    await failRefund(requestId);
    return false;
  }
  if (status === 'needs-attention') console.error(`paystack refund for request ${requestId} needs attention in the Paystack dashboard`);
  return false; // pending / processing: nothing to do yet
};

/** Webhook: refund.* events identify the original payment, so match the order's in-progress refund. */
export const handlePaystackRefundEvent = async (data: { transaction_reference?: string; status?: string }) => {
  if (!data.transaction_reference || !data.status) return;
  const request = await prisma.refundRequest.findFirst({
    where: { order: { paystackReference: data.transaction_reference }, status: { in: ['REFUNDING', 'FAILED'] } },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  });
  if (!request) {
    console.warn(`paystack refund event for ${data.transaction_reference} did not match a refund request`);
    return;
  }
  await applyPaystackRefundStatus(request.id, data.status);
};
