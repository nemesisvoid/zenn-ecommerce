'use server';

import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import type { Prisma, RefundStatus } from '@prisma/client';

const LOW_STOCK = 5;
const REFUND_ATTENTION: RefundStatus[] = ['REQUESTED', 'RECEIVED', 'FAILED'];
const PER_GROUP = 5;

export type AdminNotification = {
  id: string;
  kind: 'refund' | 'order' | 'stock';
  title: string;
  description: string;
  href: string;
  at: string | null;
};

export type AdminNotifications = {
  total: number;
  items: AdminNotification[];
};

const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

/**
 * Things that need an admin's attention right now. There is no "read" state: an item
 * disappears once it has been dealt with (refund handled, order shipped, stock topped up).
 */
export const getAdminNotifications = async (): Promise<AdminNotifications> => {
  await requireAdmin();

  // Ready to ship: confirmed online payment, or pay on delivery (paid at the door).
  const orderWhere: Prisma.OrderWhereInput = {
    status: { not: 'CANCELLED' },
    deliveryStatus: 'PENDING',
    OR: [{ paymentStatus: 'PAID' }, { paymentMethod: 'PAY_ON_DELIVERY' }],
  };
  const stockWhere: Prisma.ProductWhereInput = {
    isArchived: false,
    OR: [{ stock: { lte: LOW_STOCK } }, { variants: { some: { stock: { lte: LOW_STOCK } } } }],
  };

  const [refunds, refundCount, orders, orderCount, products, productCount] = await Promise.all([
    prisma.refundRequest.findMany({
      where: { status: { in: REFUND_ATTENTION } },
      orderBy: { updatedAt: 'desc' },
      take: PER_GROUP,
      select: { id: true, orderId: true, status: true, amount: true, updatedAt: true, user: { select: { name: true, email: true } } },
    }),
    prisma.refundRequest.count({ where: { status: { in: REFUND_ATTENTION } } }),
    prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: 'desc' },
      take: PER_GROUP,
      select: { id: true, createdAt: true, email: true, paymentMethod: true },
    }),
    prisma.order.count({ where: orderWhere }),
    prisma.product.findMany({
      where: stockWhere,
      orderBy: { stock: 'asc' },
      take: PER_GROUP,
      select: { id: true, slug: true, name: true, stock: true, variants: { where: { stock: { lte: LOW_STOCK } }, select: { stock: true } } },
    }),
    prisma.product.count({ where: stockWhere }),
  ]);

  const refundTitle = { REQUESTED: 'New refund request', RECEIVED: 'Returned items ready to refund', FAILED: 'Paystack refund failed' } as const;

  const items: AdminNotification[] = [
    ...refunds.map(r => ({
      id: `refund-${r.id}`,
      kind: 'refund' as const,
      title: refundTitle[r.status as keyof typeof refundTitle],
      description: `Order ${shortId(r.orderId)} · ${r.user.name || r.user.email}`,
      href: `/admin/orders/${r.orderId}`,
      at: r.updatedAt.toISOString(),
    })),
    ...orders.map(o => ({
      id: `order-${o.id}`,
      kind: 'order' as const,
      title: 'Order ready to ship',
      description: `${shortId(o.id)} · ${o.paymentMethod === 'PAYSTACK' ? 'Paid online' : 'Pay on delivery'} · ${o.email}`,
      href: `/admin/orders/${o.id}`,
      at: o.createdAt.toISOString(),
    })),
    ...products.map(p => {
      const lowest = Math.min(p.stock, ...p.variants.map(v => v.stock ?? Infinity));
      return {
        id: `stock-${p.id}`,
        kind: 'stock' as const,
        title: lowest <= 0 ? 'Out of stock' : 'Low stock',
        description: `${p.name} · ${lowest <= 0 ? 'none left' : `${lowest} left`}${p.variants.length > 0 ? ' (some options)' : ''}`,
        href: `/admin/products/${p.slug}`,
        at: null,
      };
    }),
  ];

  return { total: refundCount + orderCount + productCount, items };
};
