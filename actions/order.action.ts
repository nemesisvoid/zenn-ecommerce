'use server';

import { CartType } from '@/types';
import { PaymentMethod } from '@prisma/client';

interface CreateOrderProps {
  cart: CartType | undefined;
  userId: string;
  name: string;
  email: string;
  phoneNo: string | undefined;
  country: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  address: string;
}

export const createOrder = async (data: CreateOrderProps) => {
  const { cart, userId, name, email, phoneNo, paymentMethod, address, country, city } = data;
  if (!userId) throw new Error('User not found');
  if (!cart?.id) throw new Error('Cart not found');

  const reference = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const order = await prisma?.order.create({
      data: {
        userId,
        status: 'PENDING',
        phoneNo,
        email,
        country,
        city,

        shippingAddress: address,
        itemsPrice: cart.itemsPrice,
        totalPrice: cart.totalPrice,
        // productId: cart.productId,
        // taxPrice:cart.t,
        shippingPrice: cart.shippingPrice,
        paystackReference: reference,
        cartId: cart.id,
        paymentMethod: paymentMethod as PaymentMethod,
        orderItems: {
          create: cart.cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const amountInKobo = Math.round(cart.totalPrice * 100);

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/complete`,
        metadata: {
          orderId: order?.id,
          custom_fields: [
            { display_name: 'Name', variable_name: 'customer_name', value: name },
            { display_name: 'Phone', variable_name: 'customer_phone', value: phoneNo },
            { display_name: 'Address', variable_name: 'customer_address', value: address },
          ],
        },
      }),
    });

    const data = await res.json();
    console.log('data', data);

    if (!res.ok) {
      await prisma?.order.update({
        where: { id: order?.id },
        data: { status: 'ERROR' },
      });
      throw new Error(data.message) || 'Failed to intialize transaction';
    }

    await prisma?.order.update({
      where: { id: order?.id },
      data: { paystackPayload: { initialize: data.data } },
    });

    return { auth_url: data.data.authorization_url, reference, orderId: order?.id, message: 'order success' };
  } catch (error) {
    console.error(error);
  }
};

export const getOrderById = async (orderId: string, userId: string) => {
  try {
    if (!userId) throw new Error('Unauthorized! User not found');
    if (!orderId) throw new Error('Order ID is required');
    const order = await prisma?.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true, variant: true },
        },
      },
    });

    return order;
  } catch (error) {
    console.error('error gettin order:', error);
  }
};
