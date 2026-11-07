'use server';

import { requireAdmin } from '@/lib/auth-guards';

import { auth } from '@/auth';
import { getCart } from '@/actions/cart.actions';
import { decrementStock, effectiveUnitPrice, refreshCart } from '@/lib/cart';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { sendOrderEmail } from '@/helper/order-emails';
import { prisma } from '@/lib/prisma';
import { OrderSchema } from '@/schemas';
import { randomUUID } from 'crypto';
import * as z from 'zod';

// Only the customer's form details come from the browser. The user comes from the
// session and the cart (with its prices) is loaded and re-priced on the server.
export type CreateOrderInput = z.infer<typeof OrderSchema>;

type OrderFailure = { success: false; message: string };

class OutOfStockError extends Error {}

const prepareOrder = async (input: CreateOrderInput) => {
  const userId = (await auth())?.user.id;
  if (!userId) return { success: false, message: 'Please sign in to place an order' } as OrderFailure;

  const parsed = OrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid order details' } as OrderFailure;

  const cart = await getCart();
  if (!cart || cart.cartItems.length === 0) return { success: false, message: 'Your bag is empty' } as OrderFailure;

  const { outOfStock, unavailable } = await refreshCart(cart.id);
  if (unavailable.length > 0)
    return { success: false, message: `No longer available: ${unavailable.join(', ')}. Please remove it from your bag.` } as OrderFailure;
  if (outOfStock.length > 0) return { success: false, message: `Not enough stock for: ${outOfStock.join(', ')}` } as OrderFailure;

  const fresh = await prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include: { cartItems: true } });
  const { name, email, phone, address, city, country, postalCode, paymentMethod } = parsed.data;

  return {
    success: true as const,
    cartId: fresh.id,
    totalPrice: fresh.totalPrice,
    customer: { name, phone, address },
    orderData: {
      userId,
      email,
      phoneNo: phone,
      country,
      city,
      postalCode,
      shippingAddress: address,
      itemsPrice: fresh.itemsPrice,
      shippingPrice: fresh.shippingPrice,
      totalPrice: fresh.totalPrice,
      productId: fresh.cartItems[0].productId,
      cartId: fresh.id,
      paymentMethod: paymentMethod as 'PAYSTACK' | 'PAY_ON_DELIVERY',
      orderItems: {
        create: fresh.cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          price: effectiveUnitPrice(item), // the unit price actually charged
        })),
      },
    },
  };
};

type Row = { month: Date; revenue: any };

export const createOrderPayOnDelivery = async (input: CreateOrderInput) => {
  try {
    const prepared = await prepareOrder({ ...input, paymentMethod: 'PAY_ON_DELIVERY' });
    if (!prepared.success) return prepared;

    // Create the order, take the stock and clear the cart together: if stock ran out in the
    // meantime, the whole thing is rolled back and nothing is saved.
    const order = await prisma.$transaction(async tx => {
      const created = await tx.order.create({
        data: {
          ...prepared.orderData,
          status: 'CONFIRMED',
          deliveryStatus: 'PROCESSING',
          paymentStatus: 'PENDING',
        },
        include: { orderItems: true },
      });

      const short = await decrementStock(tx, created.orderItems);
      if (short.length > 0) throw new OutOfStockError();

      await tx.cart.delete({ where: { id: prepared.cartId } });
      return created;
    });

    revalidatePath('/user/settings/orders');
    // Pay-on-delivery customers get a confirmation now (online payments get a receipt once paid).
    after(() => sendOrderEmail(order.id, 'confirmed'));
    return { success: true as const, orderId: order.id, message: 'Order placed' };
  } catch (error) {
    if (error instanceof OutOfStockError) return { success: false as const, message: 'Some items just went out of stock. Please review your bag.' };
    console.error(`error placing order on delivery: ${error}`);
    return { success: false as const, message: 'Something went wrong placing your order' };
  }
};

export const createOrderPaystack = async (input: CreateOrderInput) => {
  try {
    const prepared = await prepareOrder({ ...input, paymentMethod: 'PAYSTACK' });
    if (!prepared.success) return prepared;

    // A fresh, unique reference for every order.
    const reference = `order_${randomUUID()}`;

    const order = await prisma.order.create({
      data: {
        ...prepared.orderData,
        status: 'PENDING',
        deliveryStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paystackReference: reference,
      },
    });

    const { name, phone, address } = prepared.customer;
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: order.email,
        amount: Math.round(prepared.totalPrice * 100), // kobo, from the server-priced cart
        currency: 'NGN',
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/complete`,
        metadata: {
          orderId: order.id,
          custom_fields: [
            { display_name: 'Name', variable_name: 'customer_name', value: name },
            { display_name: 'Phone', variable_name: 'customer_phone', value: phone },
            { display_name: 'Address', variable_name: 'customer_address', value: address },
          ],
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PENDING', paymentStatus: 'FAILED' },
      });
      console.error('paystack initialize failed:', data?.message);
      return { success: false as const, message: 'Could not start payment. Please try again.' };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED', paymentStatus: 'PENDING', paystackPayload: { initialize: data.data } },
    });

    return { success: true as const, auth_url: data.data.authorization_url as string, reference, orderId: order.id, message: 'Redirecting to payment' };
  } catch (error) {
    console.error('error placing paystack order:', error);
    return { success: false as const, message: 'Something went wrong placing your order' };
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const userId = (await auth())?.user.id;
    if (!userId) throw new Error('Unauthorized! User not found');
    if (!orderId) throw new Error('Order ID is required');
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: { product: { include: { colorImages: true } }, variant: true },
        },
        refundRequests: { orderBy: { createdAt: 'desc' } },
      },
    });

    return order;
  } catch (error) {
    console.error('error getting order:', error);
  }
};

export const getUserOrders = async () => {
  try {
    const userId = (await auth())?.user.id;
    if (!userId) throw new Error('Unauthorized! User not found');
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        status: true,
        deliveryStatus: true,
        paymentStatus: true,
        orderItems: { select: { id: true, quantity: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders;
  } catch (error) {
    console.error('error getting user orders:', error);
    return [];
  }
};

export const getOrderSummary = async () => {
  await requireAdmin();
  const totalOrders = await prisma.order.count();
  const totalSales = await prisma.order.aggregate({ _sum: { totalPrice: true } });
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();

  const topProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
      _count: {
        select: {
          OrderItem: true,
        },
      },
    },
    orderBy: {
      OrderItem: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  const recentSales = await prisma.order.findMany({
    select: {
      id: true,
      user: { select: { name: true } },
      totalPrice: true,
      createdAt: true,
      isDelivered: true,
      paidAt: true,
      deliveredAt: true,
      paymentMethod: true,
      email: true,
      status: true,
      shippingAddress: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return {
    totalOrders: totalOrders || 0,
    totalSales: totalSales?._sum.totalPrice || 0,
    totalUsers: totalUsers || 0,
    totalProducts: totalProducts || 0,
    topProducts,
    recentSales,
    // salesData: salesData || [],
  };
};

export async function getMonthlySales() {
  await requireAdmin();
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT month, SUM("totalPrice") AS revenue, COUNT(*) AS orders
    FROM (
      SELECT date_trunc('month', "createdAt")::date AS month, "totalPrice"
      FROM "Order"
    ) s
    GROUP BY month
    ORDER BY month ASC;
  `;

  const points = rows.map(r => ({
    month: r.month.toISOString().slice(0, 7), // YYYY-MM
    revenue: typeof r.revenue === 'object' && 'toNumber' in r.revenue ? Number(r.revenue.toNumber()) : Number(r.revenue || 0),
  }));

  return fillLast12Months(points);
}

function fillLast12Months(points: { month: string; revenue: number }[]) {
  const map = new Map(points.map(p => [p.month, p.revenue]));
  const out: { month: string; revenue: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    out.push({ month: key, revenue: map.get(key) ?? 0 });
  }
  return out;
}

export const getAllOrders = async () => {
  await requireAdmin();
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: true,
        user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, image: true, avatar: true } },
        refundRequests: { select: { status: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return orders;
  } catch (error) {
    console.error('an error occurred while fetching orders:', error);
  }
};

// export const orderStats = async () => {
//   const usersWithOrders = await prisma.user.findMany({
//     where:{
//       orders:{
//         some:
//       }
//     }
//   })
// };
