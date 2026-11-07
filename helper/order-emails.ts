// Customer emails for order status changes. Server-only (not a 'use server' module).
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/helper/utils';
import { escapeHtml, transporter } from '@/helper/send-mail';

export type OrderEmailEvent =
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'payment_received'
  | 'refund_requested'
  | 'refund_approved'
  | 'refund_rejected';

/** Optional extras: a highlighted note (return instructions, rejection reason) and a refund amount. */
export type OrderEmailExtra = { note?: string | null; amount?: number };

const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
const shortId = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

type EmailCopy = { subject: string; heading: string; message: string };

const copyFor = (event: OrderEmailEvent, orderNo: string, paid: boolean, extra: OrderEmailExtra): EmailCopy => {
  const amount = extra.amount !== undefined ? formatCurrency(extra.amount) : null;
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
        message: `We have refunded ${amount ?? 'your order in full'}. Depending on your bank it can take a few working days to appear.`,
      };
    case 'partially_refunded':
      return {
        subject: `Refund for order ${orderNo}`,
        heading: 'Your refund has been issued',
        message: `We have refunded ${amount ?? 'part of your order'}. Depending on your bank it can take a few working days to appear.`,
      };
    case 'refund_requested':
      return {
        subject: `We received your refund request for order ${orderNo}`,
        heading: 'Refund request received',
        message: `We have received your refund request${amount ? ` for ${amount}` : ''}. We review every request and will email you once we have decided. Please note that a request may or may not be accepted, and items must be returned before any refund is made.`,
      };
    case 'refund_approved':
      return {
        subject: `Your refund request for order ${orderNo} was approved`,
        heading: 'Please return your items',
        message: 'Your refund request has been approved. Please send the items back using the instructions below. We will issue your refund once we receive and check them.',
      };
    case 'refund_rejected':
      return {
        subject: `Your refund request for order ${orderNo}`,
        heading: 'We could not accept your refund request',
        message: 'We have reviewed your refund request and are unable to accept it. The reason is below. Reply to this email if you have any questions.',
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

const renderHtml = (order: EmailOrder, copy: EmailCopy, note?: string | null) => {
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
          ${note ? `<div style="margin:0 0 20px;padding:14px 16px;background:#faf6ee;border-left:3px solid #c5a05a;border-radius:8px;font-size:14px;line-height:1.6;color:#3d382f;">${escapeHtml(note).replace(/\r?\n/g, '<br/>')}</div>` : ''}
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

const renderText = (order: EmailOrder, copy: EmailCopy, note?: string | null) => {
  const lines = order.orderItems.map(item => {
    const option = [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ');
    return `- ${item.product.name}${option ? ` (${option})` : ''} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`;
  });
  return [
    `${copy.heading}`,
    '',
    copy.message,
    ...(note ? ['', note] : []),
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
export const sendOrderEmail = async (orderId: string, event: OrderEmailEvent, extra: OrderEmailExtra = {}) => {
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
    const copy = copyFor(event, shortId(order.id), paid, extra);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: order.email,
      subject: copy.subject,
      text: renderText(order, copy, extra.note),
      html: renderHtml(order, copy, extra.note),
    });
  } catch (error) {
    console.error(`order email "${event}" for ${orderId} failed`, error);
  }
};

/** Tells the store's admins that a customer has asked for a refund. Never throws. */
export const sendAdminRefundRequestEmail = async (orderId: string, requestId: string) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
    const [request, admins] = await Promise.all([
      prisma.refundRequest.findUnique({ where: { id: requestId }, include: { user: { select: { name: true, email: true } } } }),
      prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, select: { email: true } }),
    ]);
    if (!request || admins.length === 0) return;

    const items = (request.items as { name: string; option: string | null; quantity: number }[])
      .map(i => `${i.name}${i.option ? ` (${i.option})` : ''} ×${i.quantity}`)
      .join(', ');
    const url = `${appUrl()}/admin/orders/${orderId}`;
    const customer = request.user.name || request.user.email;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: admins.map(a => a.email).join(', '),
      subject: `Refund request for order ${shortId(orderId)}`,
      text: `${customer} requested a refund of ${formatCurrency(request.amount)} for order ${shortId(orderId)}.\nReason: ${request.reason}\nItems: ${items}\n${request.details ? `Details: ${request.details}\n` : ''}\nReview it: ${url}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#17140f;">
        <p><strong>${escapeHtml(customer)}</strong> requested a refund of <strong>${formatCurrency(request.amount)}</strong> for order ${shortId(orderId)}.</p>
        <p>Reason: ${escapeHtml(request.reason)}<br/>Items: ${escapeHtml(items)}</p>
        ${request.details ? `<p style="padding:10px 12px;background:#f4f1ec;border-radius:8px;">${escapeHtml(request.details)}</p>` : ''}
        <p><a href="${url}">Review the request</a></p>
      </div>`,
    });
  } catch (error) {
    console.error(`admin refund email for ${orderId} failed`, error);
  }
};
