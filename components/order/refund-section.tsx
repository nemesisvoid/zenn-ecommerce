import Link from 'next/link';
import { RotateCcwIcon } from 'lucide-react';
import type { Order, RefundRequest, RefundStatus } from '@prisma/client';

import { REFUND_WINDOW_DAYS, refundEligibility, type RefundItemSnapshot } from '@/lib/refunds';
import { formatCurrency } from '@/helper/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// What the customer sees for each stage. A failed Paystack attempt is shown as "in progress":
// the admin retries it, and the customer doesn't need to act.
const STAGES: Record<RefundStatus, { label: string; tone: string; text: string }> = {
  REQUESTED: { label: 'Under review', tone: 'bg-brand-soft text-brand-ink', text: 'We have received your request and will email you once we have reviewed it.' },
  APPROVED: { label: 'Approved: return your items', tone: 'bg-brand-soft text-brand-ink', text: 'Please send the items back using the instructions below. We will refund you once we receive and check them.' },
  RECEIVED: { label: 'Items received', tone: 'bg-brand-soft text-brand-ink', text: 'We have received your items and are processing your refund.' },
  REFUNDING: { label: 'Refund in progress', tone: 'bg-brand-soft text-brand-ink', text: 'Your refund is on its way. Depending on your bank it can take a few working days to appear.' },
  FAILED: { label: 'Refund in progress', tone: 'bg-brand-soft text-brand-ink', text: 'Your refund is being processed. We will email you when it is complete.' },
  REFUNDED: { label: 'Refunded', tone: 'bg-success/12 text-success', text: 'Your refund has been issued.' },
  REJECTED: { label: 'Declined', tone: 'bg-destructive/10 text-destructive', text: 'We were unable to accept this refund request.' },
};

const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDateTime = (date: Date) =>
  date.toLocaleString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

type Props = {
  order: Pick<Order, 'id' | 'status' | 'deliveryStatus' | 'deliveredAt' | 'paymentStatus'>;
  requests: RefundRequest[];
};

const RefundSection = ({ order, requests }: Props) => {
  const eligibility = refundEligibility(order, requests);
  const latest = requests[0];

  // Nothing to say before delivery, unless there's already a request.
  if (!latest && order.deliveryStatus !== 'DELIVERED') return null;

  return (
    <section
      aria-labelledby='refunds-heading'
      className='panel mt-8 p-6 md:p-8'>
      <h2
        id='refunds-heading'
        className='flex items-center gap-2 text-base font-semibold text-foreground'>
        <RotateCcwIcon
          className='size-4 text-muted-foreground'
          aria-hidden='true'
        />
        Returns &amp; refunds
      </h2>

      {latest && (
        <div className='mt-5 rounded-xl border border-border p-5'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', STAGES[latest.status].tone)}>{STAGES[latest.status].label}</span>
            <span className='text-xs text-muted-foreground'>Requested {formatDateTime(latest.createdAt)}</span>
          </div>
          <p className='mt-3 text-sm text-muted-foreground'>{STAGES[latest.status].text}</p>

          {latest.adminMessage && (latest.status === 'APPROVED' || latest.status === 'REJECTED' || latest.status === 'RECEIVED') && (
            <div className='mt-4 whitespace-pre-line rounded-lg border-l-2 border-brand bg-brand-soft/60 px-4 py-3 text-sm text-foreground'>
              {latest.adminMessage}
            </div>
          )}

          <ul className='mt-4 space-y-1 text-sm'>
            {(latest.items as RefundItemSnapshot[]).map(item => (
              <li
                key={item.orderItemId}
                className='flex justify-between gap-4'>
                <span className='text-foreground'>
                  {item.name}
                  {item.option && <span className='text-muted-foreground'> · {item.option}</span>} ×{item.quantity}
                </span>
                <span className='tabular-nums text-muted-foreground'>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className='mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium text-foreground'>
            <span>{latest.status === 'REFUNDED' ? 'Refunded' : 'Requested amount'}</span>
            <span className='tabular-nums'>{formatCurrency(latest.status === 'REFUNDED' ? (latest.refundedAmount ?? latest.amount) : latest.amount)}</span>
          </p>
        </div>
      )}

      {eligibility.eligible ? (
        <div className='mt-5'>
          <p className='text-sm text-muted-foreground'>
            You can request a refund until <span className='font-medium text-foreground'>{formatDate(eligibility.deadline!)}</span>. Items must be returned
            before a refund is made, and every request is reviewed, so it may or may not be accepted.
          </p>
          <Button
            asChild
            variant='outline'
            className='mt-4 h-11 rounded-full px-6'>
            <Link href={`/order/${order.id}/refund`}>Request a refund</Link>
          </Button>
        </div>
      ) : (
        !latest &&
        eligibility.reason === 'expired' && (
          <p className='mt-3 text-sm text-muted-foreground'>
            Refunds can be requested within {REFUND_WINDOW_DAYS} days of delivery. The window for this order closed on {formatDate(eligibility.deadline!)}.
          </p>
        )
      )}
    </section>
  );
};

export default RefundSection;
