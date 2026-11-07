import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, CreditCardIcon, MailIcon, MapPinIcon, PhoneIcon, UserRoundIcon } from 'lucide-react';

import { getAdminOrder } from '@/actions/admin-order.actions';
import OrderActions from '@/components/admin/orders/order-actions';
import RefundRequestPanel, { type AdminRefundRequest } from '@/components/admin/orders/refund-request-panel';
import OrderStatusPill, { formatStatus } from '@/components/shared/order-status-pill';
import { formatCurrency } from '@/helper/utils';

export const dynamic = 'force-dynamic';

const card = 'admin-card rounded-xl border border-border';
const cardTitle = 'border-b border-border px-5 py-4 text-sm font-semibold text-foreground';

const formatDateTime = (date: Date) =>
  date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const FIELD_LABELS: Record<string, string> = {
  deliveryStatus: 'Delivery',
  paymentStatus: 'Payment',
  status: 'Order',
  restocked: 'Items returned to stock',
  refundRequest: 'Refund',
};

/** Turns a logged change ({ field: { old, new } }) into "Delivery: Processing → Shipped". */
const describeChanges = (details: unknown): string[] => {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return [];
  return Object.entries(details as Record<string, { old?: unknown; new?: unknown }>).map(([field, change]) => {
    const label = FIELD_LABELS[field] ?? field;
    const fmt = (v: unknown) => (typeof v === 'string' ? formatStatus(v) : v == null ? '—' : String(v));
    return change?.old == null ? `${label}: ${fmt(change?.new)}` : `${label}: ${fmt(change.old)} → ${fmt(change.new)}`;
  });
};

const AdminOrderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await getAdminOrder(id);
  if (!data) notFound();
  const { order, history, settings } = data;

  // Refunds: the newest request gets the action panel; older ones are listed for the record.
  const toPanel = (r: (typeof order.refundRequests)[number]): AdminRefundRequest => ({
    ...r,
    items: r.items as AdminRefundRequest['items'],
    createdAt: r.createdAt.toISOString(),
  });
  const [latestRefund, ...olderRefunds] = order.refundRequests;
  const alreadyRefunded = order.refundRequests.filter(r => r.status === 'REFUNDED').reduce((sum, r) => sum + (r.refundedAmount ?? 0), 0);
  const maxRefund = Math.max(0, order.totalPrice - alreadyRefunded);
  const defaultInstructions = [
    'Please pack the items securely, include your order number, and send them to:',
    settings?.storeAddress || '[add your return address in Settings]',
    settings?.storePhone ? `Phone: ${settings.storePhone}` : null,
    'Reply to this email with the courier tracking number once you have sent them.',
  ]
    .filter(Boolean)
    .join('\n');

  const customerName =
    [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.name || order.user.email;
  const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Timeline: system events from the order itself, plus every admin change from the activity log.
  const timeline = [
    { at: order.createdAt, title: 'Order placed', lines: [`${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${formatCurrency(order.totalPrice)}`] },
    ...(order.paidAt ? [{ at: order.paidAt, title: 'Payment received', lines: [order.paymentMethod === 'PAYSTACK' ? 'Paystack' : 'Cash on delivery'] }] : []),
    ...(order.deliveredAt ? [{ at: order.deliveredAt, title: 'Delivered', lines: [] as string[] }] : []),
    ...history.map(entry => ({
      at: entry.createdAt,
      title: `Updated by ${entry.user?.name || entry.user?.email || 'an admin'}`,
      lines: describeChanges(entry.details),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div>
      <Link
        href='/admin/orders'
        className='mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'>
        <ArrowLeftIcon
          className='size-4'
          aria-hidden='true'
        />
        All orders
      </Link>

      <header className='mb-6 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold text-foreground'>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Placed {formatDateTime(order.createdAt)} · <span className='font-mono text-xs'>{order.id}</span>
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {order.status === 'CANCELLED' || order.status === 'COMPLETED' ? <OrderStatusPill status={order.status} /> : null}
          <OrderStatusPill
            label='Payment'
            status={order.paymentStatus}
          />
          <OrderStatusPill
            label='Delivery'
            status={order.deliveryStatus}
          />
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='space-y-6'>
          <section className={card}>
            <h2 className={cardTitle}>Items ({itemCount})</h2>
            <ul className='divide-y divide-border'>
              {order.orderItems.map(item => {
                const colorImages = item.variant?.color ? item.product.colorImages.find(ci => ci.color === item.variant?.color)?.images : undefined;
                const image = colorImages?.[0] ?? item.product.images[0];
                return (
                  <li
                    key={item.id}
                    className='flex items-center gap-4 px-5 py-4'>
                    <div className='relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
                      {image && (
                        <Image
                          src={image}
                          alt=''
                          fill
                          sizes='64px'
                          className='object-cover'
                        />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={`/admin/products/${item.product.slug}`}
                        className='font-medium text-foreground hover:underline'>
                        {item.product.name}
                      </Link>
                      <p className='mt-0.5 text-sm text-muted-foreground'>
                        {[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ') || 'Standard'}
                        {item.variant?.sku && <span className='font-mono text-xs'> · {item.variant.sku}</span>}
                      </p>
                    </div>
                    <div className='text-right text-sm tabular-nums'>
                      <p className='text-muted-foreground'>
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      <p className='font-medium text-foreground'>{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className='space-y-2 border-t border-border px-5 py-4 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Subtotal</dt>
                <dd className='tabular-nums text-foreground'>{formatCurrency(order.itemsPrice)}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Delivery</dt>
                <dd className='tabular-nums text-foreground'>{order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'Free'}</dd>
              </div>
              {!!order.taxPrice && order.taxPrice > 0 && (
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Tax</dt>
                  <dd className='tabular-nums text-foreground'>{formatCurrency(order.taxPrice)}</dd>
                </div>
              )}
              <div className='flex justify-between border-t border-border pt-2 text-base font-semibold'>
                <dt>Total</dt>
                <dd className='tabular-nums'>{formatCurrency(order.totalPrice)}</dd>
              </div>
            </dl>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>History</h2>
            <ol className='space-y-5 px-5 py-5'>
              {timeline.map((event, i) => (
                <li
                  key={i}
                  className='relative pl-6'>
                  <span
                    aria-hidden='true'
                    className='absolute left-0 top-1.5 size-2.5 rounded-full bg-foreground/70'
                  />
                  <p className='text-sm font-medium text-foreground'>{event.title}</p>
                  {event.lines.map(line => (
                    <p
                      key={line}
                      className='text-sm text-muted-foreground'>
                      {line}
                    </p>
                  ))}
                  <time
                    dateTime={event.at.toISOString()}
                    className='text-xs text-muted-foreground'>
                    {formatDateTime(event.at)}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className='space-y-6'>
          <section className={card}>
            <h2 className={cardTitle}>Manage order</h2>
            <div className='p-5'>
              <OrderActions
                id={order.id}
                status={order.status}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
                deliveryStatus={order.deliveryStatus}
              />
            </div>
          </section>

          {latestRefund && (
            <section className={`${card} ${['REQUESTED', 'RECEIVED', 'FAILED'].includes(latestRefund.status) ? 'ring-2 ring-amber-400/60' : ''}`}>
              <h2 className={cardTitle}>Refund request</h2>
              <div className='p-5'>
                <RefundRequestPanel
                  key={`${latestRefund.id}-${latestRefund.status}`}
                  request={toPanel(latestRefund)}
                  paymentMethod={order.paymentMethod}
                  defaultInstructions={defaultInstructions}
                  maxRefund={maxRefund}
                />
                {olderRefunds.length > 0 && (
                  <p className='mt-5 border-t border-border pt-4 text-xs text-muted-foreground'>
                    Earlier requests:{' '}
                    {olderRefunds.map(r => `${formatStatus(r.status)} (${formatCurrency(r.refundedAmount ?? r.amount)})`).join(', ')}
                  </p>
                )}
              </div>
            </section>
          )}

          <section className={card}>
            <h2 className={cardTitle}>Customer</h2>
            <div className='space-y-3 p-5 text-sm'>
              <Link
                href={`/admin/users/${order.user.id}`}
                className='flex items-center gap-2 font-medium text-foreground hover:underline'>
                <UserRoundIcon
                  className='size-4 text-muted-foreground'
                  aria-hidden='true'
                />
                {customerName}
              </Link>
              <a
                href={`mailto:${order.email}`}
                className='flex items-center gap-2 text-muted-foreground hover:text-foreground'>
                <MailIcon
                  className='size-4'
                  aria-hidden='true'
                />
                {order.email}
              </a>
              {(order.phoneNo || order.user.phone) && (
                <a
                  href={`tel:${order.phoneNo || order.user.phone}`}
                  className='flex items-center gap-2 text-muted-foreground hover:text-foreground'>
                  <PhoneIcon
                    className='size-4'
                    aria-hidden='true'
                  />
                  {order.phoneNo || order.user.phone}
                </a>
              )}
            </div>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>Delivery address</h2>
            <div className='flex gap-2 p-5 text-sm text-foreground'>
              <MapPinIcon
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden='true'
              />
              <address className='not-italic leading-relaxed'>
                {order.shippingAddress}
                <br />
                {[order.city, order.postalCode].filter(Boolean).join(' ')}
                <br />
                {order.country}
              </address>
            </div>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>Payment</h2>
            <dl className='space-y-2 p-5 text-sm'>
              <div className='flex items-center justify-between gap-3'>
                <dt className='flex items-center gap-2 text-muted-foreground'>
                  <CreditCardIcon
                    className='size-4'
                    aria-hidden='true'
                  />
                  Method
                </dt>
                <dd className='text-foreground'>{order.paymentMethod === 'PAYSTACK' ? 'Paystack' : 'Pay on delivery'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-muted-foreground'>Status</dt>
                <dd className='text-foreground'>{formatStatus(order.paymentStatus)}</dd>
              </div>
              {order.paidAt && (
                <div className='flex justify-between gap-3'>
                  <dt className='text-muted-foreground'>Paid</dt>
                  <dd className='text-foreground'>{formatDateTime(order.paidAt)}</dd>
                </div>
              )}
              {order.paystackReference && (
                <div className='flex flex-col gap-1'>
                  <dt className='text-muted-foreground'>Paystack reference</dt>
                  <dd className='break-all font-mono text-xs text-foreground'>{order.paystackReference}</dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AdminOrderPage;
