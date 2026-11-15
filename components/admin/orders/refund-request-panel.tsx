'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2Icon, RefreshCwIcon } from 'lucide-react';
import type { RefundStatus } from '@prisma/client';

import {
  approveRefundRequest,
  checkPaystackRefundStatus,
  issuePaystackRefund,
  markRefundItemsReceived,
  markRefundTransferred,
  rejectRefundRequest,
} from '@/actions/admin-refund.actions';
import { formatCurrency } from '@/helper/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Item = { orderItemId: string; name: string; option: string | null; quantity: number; unitPrice: number };

export type AdminRefundRequest = {
  id: string;
  status: RefundStatus;
  reason: string;
  details: string | null;
  items: Item[];
  amount: number;
  refundedAmount: number | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  adminMessage: string | null;
  restocked: boolean;
  createdAt: string;
};

type Props = {
  request: AdminRefundRequest;
  paymentMethod: 'PAYSTACK' | 'PAY_ON_DELIVERY';
  /** Prefilled return instructions (e.g. from the store address in settings). */
  defaultInstructions: string;
  maxRefund: number;
};

const STATUS_LABEL: Record<RefundStatus, { label: string; tone: string }> = {
  REQUESTED: { label: 'New request', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  APPROVED: { label: 'Approved: awaiting return', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  RECEIVED: { label: 'Items received: ready to refund', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  REFUNDING: { label: 'Refunding via Paystack', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  FAILED: { label: 'Paystack refund failed', tone: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  REFUNDED: { label: 'Refunded', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  REJECTED: { label: 'Declined', tone: 'bg-secondary text-muted-foreground' },
};

const RefundRequestPanel = ({ request, paymentMethod, defaultInstructions, maxRefund }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(defaultInstructions);
  const [rejectMessage, setRejectMessage] = useState('');
  const [mode, setMode] = useState<'approve' | 'reject'>('approve');
  const [showDecline, setShowDecline] = useState(false);
  const [restock, setRestock] = useState(true);
  const [amount, setAmount] = useState(String(Math.min(request.amount, maxRefund)));

  const run = (action: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const res = await action();
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      router.refresh();
    });

  const spinner = (
    <Loader2Icon
      className='size-4 animate-spin'
      aria-hidden='true'
    />
  );
  const status = STATUS_LABEL[request.status];

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', status.tone)}>{status.label}</span>
        <span className='text-xs text-muted-foreground'>
          {new Date(request.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <dl className='space-y-3 text-sm'>
        <div>
          <dt className='text-muted-foreground'>Reason</dt>
          <dd className='font-medium text-foreground'>{request.reason}</dd>
        </div>
        {request.details && (
          <div>
            <dt className='text-muted-foreground'>Customer note</dt>
            <dd className='whitespace-pre-line text-foreground'>{request.details}</dd>
          </div>
        )}
        <div>
          <dt className='text-muted-foreground'>Items to return</dt>
          <dd>
            <ul className='mt-1 space-y-1'>
              {request.items.map(item => (
                <li
                  key={item.orderItemId}
                  className='flex justify-between gap-3'>
                  <span className='text-foreground'>
                    {item.name}
                    {item.option && <span className='text-muted-foreground'> · {item.option}</span>} ×{item.quantity}
                  </span>
                  <span className='tabular-nums text-muted-foreground'>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className='mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground'>
              <span>Requested</span>
              <span className='tabular-nums'>{formatCurrency(request.amount)}</span>
            </p>
          </dd>
        </div>
        {request.accountNumber && (
          <div>
            <dt className='text-muted-foreground'>Refund to (bank transfer)</dt>
            <dd className='text-foreground'>
              {request.accountName} · {request.bankName} · <span className='font-mono'>{request.accountNumber}</span>
            </dd>
          </div>
        )}
        {request.adminMessage && request.status !== 'REQUESTED' && (
          <div>
            <dt className='text-muted-foreground'>{request.status === 'REJECTED' ? 'Reason sent to customer' : 'Return instructions sent'}</dt>
            <dd className='whitespace-pre-line text-foreground'>{request.adminMessage}</dd>
          </div>
        )}
        {request.refundedAmount !== null && (request.status === 'REFUNDED' || request.status === 'REFUNDING') && (
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Refund amount</dt>
            <dd className='font-medium tabular-nums text-foreground'>{formatCurrency(request.refundedAmount)}</dd>
          </div>
        )}
      </dl>

      {/* Step 1: review */}
      {request.status === 'REQUESTED' && (
        <div className='space-y-3 border-t border-border pt-5'>
          <div
            className='flex gap-2'
            role='tablist'
            aria-label='Decision'>
            {(['approve', 'reject'] as const).map(m => (
              <button
                key={m}
                type='button'
                role='tab'
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  mode === m ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
                )}>
                {m === 'approve' ? 'Approve return' : 'Decline'}
              </button>
            ))}
          </div>
          {mode === 'approve' ? (
            <>
              <Label htmlFor='return-instructions'>Return instructions for the customer</Label>
              <Textarea
                id='return-instructions'
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <Button
                className='w-full'
                disabled={isPending}
                onClick={() => run(() => approveRefundRequest(request.id, message))}>
                {isPending && spinner}
                Approve and email instructions
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor='reject-reason'>Reason (sent to the customer)</Label>
              <Textarea
                id='reject-reason'
                rows={4}
                value={rejectMessage}
                onChange={e => setRejectMessage(e.target.value)}
                placeholder='e.g. The item shows signs of use, so it does not qualify for a refund.'
              />
              <Button
                variant='outline'
                className='w-full text-destructive hover:text-destructive'
                disabled={isPending}
                onClick={() => run(() => rejectRefundRequest(request.id, rejectMessage))}>
                {isPending && spinner}
                Decline request
              </Button>
            </>
          )}
        </div>
      )}

      {/* Step 2: wait for the items */}
      {request.status === 'APPROVED' && (
        <div className='space-y-3 border-t border-border pt-5'>
          <div className='flex items-start gap-3'>
            <Checkbox
              id='refund-restock'
              checked={restock}
              onCheckedChange={checked => setRestock(checked === true)}
            />
            <Label
              htmlFor='refund-restock'
              className='font-normal leading-snug'>
              Put the returned items back in stock
              <span className='block text-xs text-muted-foreground'>Untick if they are damaged and can&apos;t be resold.</span>
            </Label>
          </div>
          <Button
            className='w-full'
            disabled={isPending}
            onClick={() => run(() => markRefundItemsReceived(request.id, restock))}>
            {isPending && spinner}
            Items received
          </Button>
          {showDecline ? (
            <div className='space-y-2 pt-2'>
              <Label htmlFor='late-reject-reason'>Reason for declining (sent to the customer)</Label>
              <Textarea
                id='late-reject-reason'
                rows={3}
                value={rejectMessage}
                onChange={e => setRejectMessage(e.target.value)}
                placeholder='e.g. We did not receive the items within 14 days of approval.'
              />
              <Button
                variant='outline'
                className='w-full text-destructive hover:text-destructive'
                disabled={isPending}
                onClick={() => run(() => rejectRefundRequest(request.id, rejectMessage))}>
                Decline request
              </Button>
            </div>
          ) : (
            <Button
              variant='ghost'
              className='w-full text-muted-foreground'
              disabled={isPending}
              onClick={() => setShowDecline(true)}>
              Items never arrived? Decline
            </Button>
          )}
        </div>
      )}

      {/* Step 3: send the money */}
      {(request.status === 'RECEIVED' || request.status === 'FAILED') && (
        <div className='space-y-3 border-t border-border pt-5'>
          <Label htmlFor='refund-amount'>Amount to refund (₦)</Label>
          <Input
            id='refund-amount'
            type='number'
            min={1}
            max={maxRefund}
            step='0.01'
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <p className='text-xs text-muted-foreground'>Up to {formatCurrency(maxRefund)}. Delivery isn&apos;t included by default.</p>
          {paymentMethod === 'PAYSTACK' ? (
            <Button
              className='w-full'
              disabled={isPending}
              onClick={() => run(() => issuePaystackRefund(request.id, Number(amount)))}>
              {isPending && spinner}
              {request.status === 'FAILED' ? 'Retry refund via Paystack' : 'Refund via Paystack'}
            </Button>
          ) : (
            <Button
              className='w-full'
              disabled={isPending}
              onClick={() => run(() => markRefundTransferred(request.id, Number(amount)))}>
              {isPending && spinner}
              I&apos;ve sent the bank transfer
            </Button>
          )}
        </div>
      )}

      {request.status === 'REFUNDING' && (
        <div className='space-y-3 border-t border-border pt-5'>
          <p className='text-sm text-muted-foreground'>Paystack is processing the refund. This updates automatically when Paystack confirms it.</p>
          <Button
            variant='outline'
            className='w-full'
            disabled={isPending}
            onClick={() => run(() => checkPaystackRefundStatus(request.id))}>
            {isPending ? spinner : <RefreshCwIcon className='size-4' />}
            Check refund status
          </Button>
        </div>
      )}
    </div>
  );
};

export default RefundRequestPanel;
