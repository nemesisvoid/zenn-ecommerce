import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';

import { getOrderById } from '@/actions/order.action';
import { auth } from '@/auth';
import { refundEligibility, REFUND_REASONS, REFUND_WINDOW_DAYS } from '@/lib/refunds';
import { loginUrlFor } from '@/routes';
import RefundRequestForm from '@/components/order/refund-request-form';

export const dynamic = 'force-dynamic';

const RefundRequestPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user.id) redirect(loginUrlFor(`/order/${id}/refund`));

  const order = await getOrderById(id);
  if (!order) notFound();

  // Ineligible (window closed, already requested, not delivered…): the order page explains why.
  const eligibility = refundEligibility(order, order.refundRequests);
  if (!eligibility.eligible) redirect(`/order/${id}`);

  const items = order.orderItems.map(item => {
    const colorImages = item.variant ? item.product.colorImages.find(ci => ci.color === item.variant?.color)?.images : undefined;
    return {
      id: item.id,
      name: item.product.name,
      option: [item.variant?.color, item.variant?.size].filter(Boolean).join(' / ') || null,
      image: colorImages?.[0] ?? item.product.images[0] ?? null,
      quantity: item.quantity,
      unitPrice: item.price,
    };
  });

  return (
    <div className='container'>
      <div className='mx-auto max-w-2xl'>
        <Link
          href={`/order/${id}`}
          className='mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'>
          <ArrowLeftIcon
            className='size-4'
            aria-hidden='true'
          />
          Back to order
        </Link>

        <h1 className='page-title'>Request a refund</h1>
        <p className='lede mt-3'>Order #{order.id.slice(0, 8).toUpperCase()}</p>

        <div
          role='note'
          className='mt-8 rounded-2xl border border-border bg-secondary/60 p-5 text-sm leading-relaxed text-foreground'>
          <p className='font-semibold'>Before you submit</p>
          <ul className='mt-2 list-disc space-y-1 pl-5 text-muted-foreground'>
            <li>Refund requests must be made within {REFUND_WINDOW_DAYS} days of delivery.</li>
            <li>Items must be returned to us before any refund is made. We will email you the return instructions if your request is approved.</li>
            <li>
              <span className='font-medium text-foreground'>Submitting a request does not guarantee a refund.</span> We review every request and may or may
              not accept it.
            </li>
            <li>Delivery charges are not refunded.</li>
          </ul>
        </div>

        <RefundRequestForm
          orderId={order.id}
          items={items}
          reasons={[...REFUND_REASONS]}
          needsBankDetails={order.paymentMethod === 'PAY_ON_DELIVERY'}
        />
      </div>
    </div>
  );
};

export default RefundRequestPage;
