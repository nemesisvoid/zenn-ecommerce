'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import type { DeliveryStatus, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { incrementStock } from '@/lib/cart';
import { applyPaystackPayment, fetchPaystackTransaction } from '@/lib/payments';
import { logActivity } from './activity.action';
import { sendOrderEmail, type OrderEmailEvent } from '@/helper/order-emails';

type Result = { success: boolean; message: string };

const DELIVERY_STATUSES: DeliveryStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED'];
const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

/** Emails the customer after the response is sent, so a slow mail server never delays the admin. */
const notifyCustomer = (id: string, event: OrderEmailEvent) => after(() => sendOrderEmail(id, event));

const revalidateOrder = (id: string) => {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');
  revalidatePath(`/order/${id}`);
  revalidatePath('/user/settings/orders');
};

type Change = { old: Prisma.InputJsonValue | null; new: Prisma.InputJsonValue | null };

const logOrderChange = (id: string, details: Record<string, Change>) =>
  logActivity({ action: 'UPDATE', entity: 'ORDER', entityId: id, entityName: `Order ${shortId(id)}`, details });

/** An order is complete once it is both paid and delivered. */
const nextOrderStatus = (current: OrderStatus, payment: PaymentStatus, delivery: DeliveryStatus): OrderStatus => {
  if (current === 'CANCELLED') return current;
  if (payment === 'PAID' && delivery === 'DELIVERED') return 'COMPLETED';
  if (current === 'COMPLETED') return 'CONFIRMED'; // no longer both paid and delivered
  return current;
};

export const getAdminOrder = async (id: string) => {
  await requireAdmin();
  const [order, history] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, slug: true, images: true, colorImages: true } },
            variant: { select: { color: true, size: true, sku: true } },
          },
        },
        user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, phone: true, image: true, avatar: true } },
        refundRequests: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.activityLog.findMany({
      where: { entity: 'ORDER', entityId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  if (!order) return null;
  const settings = await prisma.settings.findFirst({ select: { storeName: true, storeAddress: true, storePhone: true } });
  return { order, history, settings };
};

export const updateDeliveryStatus = async (id: string, status: DeliveryStatus): Promise<Result> => {
  try {
    await requireAdmin();
    if (!DELIVERY_STATUSES.includes(status)) return { success: false, message: 'Unknown delivery status' };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'CANCELLED') return { success: false, message: 'This order is cancelled' };
    if (order.deliveryStatus === status) return { success: true, message: 'No change' };

    const unpaidOnline = order.paymentMethod === 'PAYSTACK' && order.paymentStatus !== 'PAID';
    if (unpaidOnline && (status === 'SHIPPED' || status === 'DELIVERED')) {
      return { success: false, message: "The Paystack payment hasn't been confirmed, so this order can't be shipped yet" };
    }

    const delivered = status === 'DELIVERED';
    const newStatus = nextOrderStatus(order.status, order.paymentStatus, status);
    await prisma.order.update({
      where: { id },
      data: {
        deliveryStatus: status,
        isDelivered: delivered,
        deliveredAt: delivered ? (order.deliveredAt ?? new Date()) : null,
        status: newStatus,
      },
    });

    await logOrderChange(id, {
      deliveryStatus: { old: order.deliveryStatus, new: status },
      ...(newStatus !== order.status ? { status: { old: order.status, new: newStatus } } : {}),
    });
    revalidateOrder(id);
    if (status === 'SHIPPED') notifyCustomer(id, 'shipped');
    if (status === 'DELIVERED') notifyCustomer(id, 'delivered');
    return { success: true, message: `Delivery status set to ${status.toLowerCase()}` };
  } catch (error) {
    console.error('error updating delivery status', error);
    return { success: false, message: 'Could not update the delivery status' };
  }
};

/** Pay-on-delivery only: the courier collected the money. Paystack orders are confirmed by Paystack. */
export const markOrderPaid = async (id: string): Promise<Result> => {
  try {
    await requireAdmin();
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return { success: false, message: 'Order not found' };
    if (order.paymentMethod !== 'PAY_ON_DELIVERY') return { success: false, message: 'Online payments are confirmed by Paystack. Use "Re-check with Paystack".' };
    if (order.status === 'CANCELLED') return { success: false, message: 'This order is cancelled' };
    if (order.paymentStatus === 'PAID') return { success: true, message: 'Already marked as paid' };

    const newStatus = nextOrderStatus(order.status, 'PAID', order.deliveryStatus);
    await prisma.order.update({
      where: { id },
      data: { paymentStatus: 'PAID', isPaid: true, paidAt: new Date(), status: newStatus },
    });

    await logOrderChange(id, {
      paymentStatus: { old: order.paymentStatus, new: 'PAID' },
      ...(newStatus !== order.status ? { status: { old: order.status, new: newStatus } } : {}),
    });
    revalidateOrder(id);
    notifyCustomer(id, 'payment_received');
    return { success: true, message: 'Payment recorded' };
  } catch (error) {
    console.error('error marking order paid', error);
    return { success: false, message: 'Could not record the payment' };
  }
};

/** Records a refund made outside the app (e.g. in the Paystack dashboard). It does not move money. */
export const recordRefund = async (id: string, kind: 'full' | 'partial'): Promise<Result> => {
  try {
    await requireAdmin();
    if (kind !== 'full' && kind !== 'partial') return { success: false, message: 'Unknown refund type' };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return { success: false, message: 'Order not found' };
    if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'PARTIALLY_REFUNDED') {
      return { success: false, message: 'Only paid orders can be refunded' };
    }

    const paymentStatus: PaymentStatus = kind === 'full' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    if (order.paymentStatus === paymentStatus) return { success: true, message: 'No change' };

    const newStatus = nextOrderStatus(order.status, paymentStatus, order.deliveryStatus);
    await prisma.order.update({ where: { id }, data: { paymentStatus, status: newStatus } });

    await logOrderChange(id, {
      paymentStatus: { old: order.paymentStatus, new: paymentStatus },
      ...(newStatus !== order.status ? { status: { old: order.status, new: newStatus } } : {}),
    });
    revalidateOrder(id);
    notifyCustomer(id, kind === 'full' ? 'refunded' : 'partially_refunded');
    return { success: true, message: kind === 'full' ? 'Full refund recorded' : 'Partial refund recorded' };
  } catch (error) {
    console.error('error recording refund', error);
    return { success: false, message: 'Could not record the refund' };
  }
};

/** Asks Paystack for the latest state of this order's payment and applies it (same path as the webhook). */
export const recheckPaystackPayment = async (id: string): Promise<Result> => {
  try {
    await requireAdmin();
    const order = await prisma.order.findUnique({ where: { id }, select: { paymentMethod: true, paystackReference: true, paymentStatus: true } });
    if (!order) return { success: false, message: 'Order not found' };
    if (order.paymentMethod !== 'PAYSTACK' || !order.paystackReference) return { success: false, message: 'This order was not paid online' };
    if (order.paymentStatus === 'PAID') return { success: true, message: 'Payment is already confirmed' };

    const tx = await fetchPaystackTransaction(order.paystackReference);
    if (!tx) return { success: false, message: 'Paystack has no record of this payment yet' };

    const result = await applyPaystackPayment(tx);
    revalidateOrder(id);
    if (result.ok) {
      await logOrderChange(id, { paymentStatus: { old: order.paymentStatus, new: 'PAID' } });
      return { success: true, message: 'Payment confirmed by Paystack' };
    }
    return { success: false, message: `Paystack: ${result.message}` };
  } catch (error) {
    console.error('error re-checking paystack payment', error);
    return { success: false, message: 'Could not reach Paystack. Try again shortly.' };
  }
};

export const cancelOrder = async (id: string, restock: boolean): Promise<Result> => {
  try {
    await requireAdmin();
    const order = await prisma.order.findUnique({ where: { id }, include: { orderItems: true } });
    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'CANCELLED') return { success: true, message: 'Order is already cancelled' };
    if (order.deliveryStatus === 'DELIVERED' || order.status === 'COMPLETED') {
      return { success: false, message: 'Delivered orders can’t be cancelled. Set the delivery status to Returned instead.' };
    }

    await prisma.$transaction(async tx => {
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
      if (restock) await incrementStock(tx, order.orderItems);
    });

    await logActivity({
      action: 'UPDATE',
      entity: 'ORDER',
      entityId: id,
      entityName: `Order ${shortId(id)}`,
      details: { status: { old: order.status, new: 'CANCELLED' }, restocked: { old: null, new: restock ? 'Yes' : 'No' } },
    });
    revalidateOrder(id);
    notifyCustomer(id, 'cancelled');

    const paid = order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIALLY_REFUNDED';
    return { success: true, message: paid ? 'Order cancelled. It was paid, so remember to refund the customer.' : 'Order cancelled' };
  } catch (error) {
    console.error('error cancelling order', error);
    return { success: false, message: 'Could not cancel the order' };
  }
};
