'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BanknoteIcon, Loader2Icon, RefreshCwIcon, Undo2Icon, XCircleIcon } from 'lucide-react';
import type { DeliveryStatus, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

import { cancelOrder, markOrderPaid, recheckPaystackPayment, recordRefund, updateDeliveryStatus } from '@/actions/admin-order.actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Props = {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
};

const DELIVERY_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing (being packed)' },
  { value: 'SHIPPED', label: 'Shipped (with courier)' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
];

const sectionTitle = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

const OrderActions = ({ id, status, paymentMethod, paymentStatus, deliveryStatus }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [delivery, setDelivery] = useState<DeliveryStatus>(deliveryStatus);
  const [refundKind, setRefundKind] = useState<'full' | 'partial'>('full');
  // Stock was taken when a pay-on-delivery order was placed, or when an online payment was confirmed.
  const [restock, setRestock] = useState(paymentMethod === 'PAY_ON_DELIVERY' || paymentStatus === 'PAID');

  const cancelled = status === 'CANCELLED';
  const paid = paymentStatus === 'PAID' || paymentStatus === 'PARTIALLY_REFUNDED';
  const unpaidOnline = paymentMethod === 'PAYSTACK' && paymentStatus !== 'PAID';
  const canCancel = !cancelled && status !== 'COMPLETED' && deliveryStatus !== 'DELIVERED';

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

  if (cancelled) {
    return (
      <div className='space-y-4 text-sm text-muted-foreground'>
        <p>
          This order is cancelled, so its status can no longer be changed.
          {paid && ' It was paid: make sure the customer has been refunded, then record the refund below.'}
        </p>
        {paid && (
          <Button
            variant='outline'
            className='w-full'
            disabled={isPending}
            onClick={() => run(() => recordRefund(id, 'full'))}>
            {isPending ? spinner : <Undo2Icon className='size-4' />}
            Record full refund
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-7'>
      {/* Delivery */}
      <section className='space-y-3'>
        <h3 className={sectionTitle}>Delivery</h3>
        <Select
          value={delivery}
          onValueChange={value => setDelivery(value as DeliveryStatus)}
          disabled={isPending}>
          <SelectTrigger
            className='w-full'
            aria-label='Delivery status'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_OPTIONS.map(option => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={unpaidOnline && (option.value === 'SHIPPED' || option.value === 'DELIVERED')}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {unpaidOnline && <p className='text-xs text-muted-foreground'>Shipping unlocks once the Paystack payment is confirmed.</p>}
        <Button
          className='w-full'
          disabled={isPending || delivery === deliveryStatus}
          onClick={() => run(() => updateDeliveryStatus(id, delivery))}>
          {isPending && spinner}
          Update delivery status
        </Button>
      </section>

      {/* Payment */}
      <section className='space-y-3'>
        <h3 className={sectionTitle}>Payment</h3>

        {paymentMethod === 'PAY_ON_DELIVERY' && !paid && paymentStatus !== 'REFUNDED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                className='w-full'
                disabled={isPending}>
                <BanknoteIcon className='size-4' />
                Mark as paid (cash received)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Record the cash payment?</AlertDialogTitle>
                <AlertDialogDescription>Only do this once the money has actually been collected. The customer will see the order as paid.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => run(() => markOrderPaid(id))}>Mark as paid</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {unpaidOnline && (
          <Button
            variant='outline'
            className='w-full'
            disabled={isPending}
            onClick={() => run(() => recheckPaystackPayment(id))}>
            {isPending ? spinner : <RefreshCwIcon className='size-4' />}
            Re-check with Paystack
          </Button>
        )}

        {paid && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                className='w-full'
                disabled={isPending}>
                <Undo2Icon className='size-4' />
                Record refund
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Record a refund</AlertDialogTitle>
                <AlertDialogDescription>
                  This only records the refund on the order. Send the money back first, in your Paystack dashboard or by transfer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <RadioGroup
                value={refundKind}
                onValueChange={value => setRefundKind(value as 'full' | 'partial')}
                className='gap-3'>
                <div className='flex items-center gap-3'>
                  <RadioGroupItem
                    value='full'
                    id='refund-full'
                  />
                  <Label htmlFor='refund-full'>Full refund</Label>
                </div>
                <div className='flex items-center gap-3'>
                  <RadioGroupItem
                    value='partial'
                    id='refund-partial'
                  />
                  <Label htmlFor='refund-partial'>Partial refund</Label>
                </div>
              </RadioGroup>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => run(() => recordRefund(id, refundKind))}>Record refund</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {paymentStatus === 'REFUNDED' && <p className='text-sm text-muted-foreground'>Fully refunded.</p>}
      </section>

      {/* Cancel */}
      {canCancel && (
        <section className='space-y-3 border-t border-border pt-6'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                className='w-full text-destructive hover:bg-destructive/10 hover:text-destructive'
                disabled={isPending}>
                <XCircleIcon className='size-4' />
                Cancel order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  The order will be marked cancelled and can&apos;t be reopened.
                  {paid && ' It has been paid, so you will need to refund the customer.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='restock'
                  checked={restock}
                  onCheckedChange={checked => setRestock(checked === true)}
                />
                <Label
                  htmlFor='restock'
                  className='font-normal leading-snug'>
                  Return the items to stock
                  <span className='mt-1 block text-xs text-muted-foreground'>
                    Leave this ticked if stock was taken for this order (pay on delivery, or a confirmed online payment).
                  </span>
                </Label>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive text-white hover:bg-destructive/90'
                  onClick={() => run(() => cancelOrder(id, restock))}>
                  Cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      )}
    </div>
  );
};

export default OrderActions;
