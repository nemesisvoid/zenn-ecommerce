// Customer emails for order status changes. Server-only (not a 'use server' module).
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/helper/utils';
import { escapeHtml, transporter } from '@/helper/send-mail';

export type OrderEmailEvent = 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded' | 'payment_received';

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

type EmailCopy = { subject: string; heading: string; message: string };

const copyFor = (event: OrderEmailEvent, orderNo: string, paid: boolean): EmailCopy => {
  switch (event) {
    case 'confirmed':
      return {
        subject: `Order ${orderNo} confirmed`,
        heading: 'Thanks for your order',
        message: 'Your order is confirmed and we are getting it ready. You will pay when it arrives.',
      };
    case 'shipped':
      return {
        subject: `Order ${orderNo} is on its way`,
        heading: 'Your order has shipped',
        message: 'Good news: your order is with our courier and on its way to you.',
      };
    case 'delivered':
      return {
        subject: `Order ${orderNo} has been delivered`,
        heading: 'Your order has been delivered',
        message: 'Your order has been delivered. We hope you love it. If anything is wrong, just reply to this email.',
      };
    case 'cancelled':
      return {
        subject: `Order ${orderNo} has been cancelled`,
        heading: 'Your order has been cancelled',
        message: paid
          ? 'Your order has been cancelled. As you have already paid, we will refund you and let you know once it is done.'
          : 'Your order has been cancelled. You have not been charged.',
      };
    case 'refunded':
      return {
        subject: `Refund for order ${orderNo}`,
        heading: 'Your refund has been issued',
        message: 'We have refunded your order in full. Depending on your bank it can take a few working days to appear.',
      };
    case 'partially_refunded':
      return {
        subject: `Partial refund for order ${orderNo}`,
        heading: 'A partial refund has been issued',
        message: 'We have issued a partial refund for your order. Depending on your bank it can take a few working days to appear.',
      };
    case 'payment_received':
      return {
        subject: `Payment received for order ${orderNo}`,
        heading: 'Payment received',
        message: 'Thank you, we have received your payment. Here is your receipt.',
      };
  }
};

type EmailOrder = {
  id: string;
  email: string;
  totalPrice: number;
  itemsPrice: number;
  shippingPrice: number;
  shippingAddress: string;
  city: string;
  country: string;
  user: { firstName: string | null; name: string | null };
  orderItems: { quantity: number; price: number; product: { name: string }; variant: { color: string | null; size: string | null } | null }[];
};

const renderHtml = (order: EmailOrder, copy: EmailCopy) => {
  const greetingName = order.user.firstName || order.user.name;
  const orderUrl = `${appUrl()}/order/${order.id}`;
  const rows = order.orderItems
    .map(item => {
      const option = [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;color:#17140f;">${escapeHtml(item.product.name)}</div>
          ${option ? `<div style="font-size:13px;color:#6b6459;">${escapeHtml(option)}</div>` : ''}
        </td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid #eee;color:#6b6459;">×${item.quantity}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eee;color:#17140f;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html><body style="margin:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;color:#17140f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #eee;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Zenn</td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 6px;font-size:13px;color:#6b6459;">Order ${shortId(order.id)}</p>
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(copy.heading)}</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d382f;">${greetingName ? `Hi ${escapeHtml(greetingName)}, ` : ''}${escapeHtml(copy.message)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:12px;">
            <tr><td style="padding:4px 0;color:#6b6459;">Subtotal</td><td align="right">${formatCurrency(order.itemsPrice)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b6459;">Delivery</td><td align="right">${order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'Free'}</td></tr>
            <tr><td style="padding:8px 0 0;font-weight:700;font-size:16px;">Total</td><td align="right" style="padding:8px 0 0;font-weight:700;font-size:16px;">${formatCurrency(order.totalPrice)}</td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6b6459;">Delivering to: ${escapeHtml(`${order.shippingAddress}, ${order.city}, ${order.country}`)}</p>
          <p style="margin:24px 0 0;"><a href="${orderUrl}" style="display:inline-block;background:#17140f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;">View your order</a></p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#faf8f5;font-size:12px;color:#8a8378;">Questions about your order? Just reply to this email.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

const renderText = (order: EmailOrder, copy: EmailCopy) => {
  const lines = order.orderItems.map(item => {
    const option = [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
    return `- ${item.product.name}${option ? ` (${option})` : ''} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`;
  });
  return [
    `${copy.heading}`,
    '',
    copy.message,
    '',
    `Order ${shortId(order.id)}`,
    ...lines,
    `Total: ${formatCurrency(order.totalPrice)}`,
    '',
    `View your order: ${appUrl()}/order/${order.id}`,
  ].join('\n');
};

/**
 * Emails the customer about an order event. Never throws: email problems are logged and must
 * not affect the order change that triggered them.
 */
export const sendOrderEmail = async (orderId: string, event: OrderEmailEvent) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(`order email "${event}" for ${orderId} skipped: email is not configured`);
      return;
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { firstName: true, name: true } },
        orderItems: { include: { product: { select: { name: true } }, variant: { select: { color: true, size: true } } } },
      },
    });
    if (!order) return;

    const paid = order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIALLY_REFUNDED';
    const copy = copyFor(event, shortId(order.id), paid);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: order.email,
      subject: copy.subject,
      text: renderText(order, copy),
      html: renderHtml(order, copy),
    });
  } catch (error) {
    console.error(`order email "${event}" for ${orderId} failed`, error);
  }
};
