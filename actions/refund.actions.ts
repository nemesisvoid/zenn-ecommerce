'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import { getSessionUser } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { REFUND_REASONS, refundEligibility, type RefundItemSnapshot } from '@/lib/refunds';
import { sendAdminRefundRequestEmail, sendOrderEmail } from '@/helper/order-emails';

const RefundRequestSchema = z.object({
  reason: z.enum(REFUND_REASONS, { errorMap: () => ({ message: 'Choose a reason' }) }),
  details: z.string().trim().max(1000, 'Keep the details under 1000 characters').optional(),
  items: z
    .array(z.object({ orderItemId: z.string().min(1), quantity: z.number().int().min(1) }))
    .min(1, 'Choose at least one item to return'),
  bankName: z.string().trim().max(80).optional(),
  accountNumber: z.string().trim().optional(),
  accountName: z.string().trim().max(120).optional(),
});

export type RefundRequestInput = z.input<typeof RefundRequestSchema>;

export const createRefundRequest = async (orderId: string, input: RefundRequestInput) => {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, message: 'Please sign in' };

    const parsed = RefundRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? 'Check the form and try again' };
    const data = parsed.data;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        orderItems: { include: { product: { select: { name: true } }, variant: { select: { color: true, size: true } } } },
        refundRequests: { select: { status: true } },
      },
    });
    if (!order) return { success: false, message: 'Order not found' };

    const eligibility = refundEligibility(order, order.refundRequests);
    if (!eligibility.eligible) {
      const messages: Record<string, string> = {
        open: 'You already have a refund request open for this order.',
        expired: `Refund requests must be made within 3 days of delivery.`,
        not_delivered: 'Refunds can be requested once your order has been delivered.',
        not_paid: 'This order has no payment to refund.',
        cancelled: 'This order was cancelled.',
      };
      return { success: false, message: messages[eligibility.reason] ?? 'This order is not eligible for a refund.' };
    }

    // Build the snapshot from the order itself: never trust names, prices or quantities from the browser.
    const items: RefundItemSnapshot[] = [];
    for (const requested of data.items) {
      const line = order.orderItems.find(item => item.id === requested.orderItemId);
      if (!line) return { success: false, message: 'One of the items is not part of this order' };
      if (requested.quantity > line.quantity) return { success: false, message: `You can return at most ${line.quantity} of ${line.product.name}` };
      items.push({
        orderItemId: line.id,
        name: line.product.name,
        option: [line.variant?.color, line.variant?.size].filter(Boolean).join(' / ') || null,
        quantity: requested.quantity,
        unitPrice: line.price,
      });
    }
    const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Pay-on-delivery orders can't be refunded through Paystack, so we need bank details for a transfer.
    const needsBank = order.paymentMethod === 'PAY_ON_DELIVERY';
    if (needsBank) {
      if (!data.bankName || !data.accountName) return { success: false, message: 'Enter your bank name and account name for the refund' };
      if (!/^\d{10}$/.test(data.accountNumber ?? '')) return { success: false, message: 'Enter your 10-digit account number' };
    }

    const request = await prisma.refundRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason: data.reason,
        details: data.details || null,
        items,
        amount,
        bankName: needsBank ? data.bankName : null,
        accountNumber: needsBank ? data.accountNumber : null,
        accountName: needsBank ? data.accountName : null,
      },
    });

    revalidatePath(`/order/${order.id}`);
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath('/admin/orders');
    after(async () => {
      await sendOrderEmail(order.id, 'refund_requested', { amount });
      await sendAdminRefundRequestEmail(order.id, request.id);
    });

    return { success: true, message: 'Your refund request has been sent' };
  } catch (error) {
    console.error('error creating refund request', error);
    return { success: false, message: 'Something went wrong sending your request' };
  }
};
