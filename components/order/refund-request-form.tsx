'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2Icon, MinusIcon, PlusIcon } from 'lucide-react';

import { createRefundRequest, type RefundRequestInput } from '@/actions/refund.actions';
import { formatCurrency } from '@/helper/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Item = { id: string; name: string; option: string | null; image: string | null; quantity: number; unitPrice: number };

type Props = {
  orderId: string;
  items: Item[];
  reasons: string[];
  needsBankDetails: boolean;
};

const RefundRequestForm = ({ orderId, items, reasons, needsBankDetails }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Quantity to return per order line; 0 = not returning that item.
  const [quantities, setQuantities] = useState<Record<string, number>>(() => Object.fromEntries(items.map(i => [i.id, items.length === 1 ? i.quantity : 0])));
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = items.filter(i => quantities[i.id] > 0);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * (quantities[i.id] ?? 0), 0), [items, quantities]);

  const setQty = (id: string, qty: number) => setQuantities(prev => ({ ...prev, [id]: qty }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selected.length === 0) return setError('Choose at least one item to return.');
    if (!reason) return setError('Choose a reason for the refund.');
    if (needsBankDetails && !/^\d{10}$/.test(bank.accountNumber)) return setError('Enter your 10-digit account number.');
    if (!acknowledged) return setError('Please confirm you understand how refunds work.');

    startTransition(async () => {
      const res = await createRefundRequest(orderId, {
        reason: reason as RefundRequestInput['reason'], // chosen from the server's list; re-validated there
        details: details || undefined,
        items: selected.map(i => ({ orderItemId: i.id, quantity: quantities[i.id] })),
        ...(needsBankDetails ? bank : {}),
      });
      if (!res.success) {
        setError(res.message);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push(`/order/${orderId}`);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className='mt-8 space-y-8'
      noValidate>
      <fieldset>
        <legend className='text-base font-semibold text-foreground'>Which items are you returning?</legend>
        <ul className='mt-4 divide-y divide-border rounded-2xl border border-border'>
          {items.map(item => {
            const qty = quantities[item.id] ?? 0;
            return (
              <li
                key={item.id}
                className='flex items-center gap-4 p-4'>
                <Checkbox
                  id={`item-${item.id}`}
                  checked={qty > 0}
                  onCheckedChange={checked => setQty(item.id, checked ? item.quantity : 0)}
                  aria-label={`Return ${item.name}`}
                />
                <div className='relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted'>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt=''
                      fill
                      sizes='56px'
                      className='object-cover'
                    />
                  )}
                </div>
                <label
                  htmlFor={`item-${item.id}`}
                  className='min-w-0 flex-1 cursor-pointer'>
                  <span className='block truncate text-sm font-medium text-foreground'>{item.name}</span>
                  <span className='block text-sm text-muted-foreground'>
                    {item.option ? `${item.option} · ` : ''}
                    {formatCurrency(item.unitPrice)} each
                  </span>
                </label>
                {item.quantity > 1 && qty > 0 && (
                  <div
                    className='flex h-9 items-center rounded-full border border-input'
                    role='group'
                    aria-label={`Quantity of ${item.name} to return`}>
                    <button
                      type='button'
                      className='flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40'
                      onClick={() => setQty(item.id, Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      aria-label='Return one fewer'>
                      <MinusIcon className='size-3.5' />
                    </button>
                    <span className='min-w-5 text-center text-sm tabular-nums'>{qty}</span>
                    <button
                      type='button'
                      className='flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40'
                      onClick={() => setQty(item.id, Math.min(item.quantity, qty + 1))}
                      disabled={qty >= item.quantity}
                      aria-label='Return one more'>
                      <PlusIcon className='size-3.5' />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className='space-y-2'>
        <Label htmlFor='refund-reason'>Reason</Label>
        <Select
          value={reason}
          onValueChange={setReason}>
          <SelectTrigger
            id='refund-reason'
            className='h-11 w-full'>
            <SelectValue placeholder='Choose a reason' />
          </SelectTrigger>
          <SelectContent>
            {reasons.map(r => (
              <SelectItem
                key={r}
                value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='refund-details'>Tell us more (optional)</Label>
        <Textarea
          id='refund-details'
          value={details}
          onChange={e => setDetails(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder='What went wrong? Details help us review your request faster.'
        />
      </div>

      {needsBankDetails && (
        <fieldset className='space-y-4'>
          <legend className='text-base font-semibold text-foreground'>Where should we send your refund?</legend>
          <p className='text-sm text-muted-foreground'>You paid on delivery, so approved refunds are sent by bank transfer.</p>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2 sm:col-span-2'>
              <Label htmlFor='bank-name'>Bank</Label>
              <Input
                id='bank-name'
                value={bank.bankName}
                onChange={e => setBank(b => ({ ...b, bankName: e.target.value }))}
                autoComplete='off'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='account-number'>Account number</Label>
              <Input
                id='account-number'
                inputMode='numeric'
                maxLength={10}
                value={bank.accountNumber}
                onChange={e => setBank(b => ({ ...b, accountNumber: e.target.value.replace(/\D/g, '') }))}
                autoComplete='off'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='account-name'>Account name</Label>
              <Input
                id='account-name'
                value={bank.accountName}
                onChange={e => setBank(b => ({ ...b, accountName: e.target.value }))}
                autoComplete='off'
              />
            </div>
          </div>
        </fieldset>
      )}

      <div className='flex items-start gap-3 rounded-xl border border-border p-4'>
        <Checkbox
          id='refund-ack'
          checked={acknowledged}
          onCheckedChange={checked => setAcknowledged(checked === true)}
        />
        <Label
          htmlFor='refund-ack'
          className='font-normal leading-relaxed'>
          I understand that my request will be reviewed and may or may not be accepted, and that the items must be returned before any refund is made.
        </Label>
      </div>

      {error && (
        <p
          role='alert'
          className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <div className='flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6'>
        <p className='text-sm text-muted-foreground'>
          Items value: <span className='font-semibold tabular-nums text-foreground'>{formatCurrency(total)}</span>
        </p>
        <Button
          type='submit'
          className='h-11 rounded-full px-6'
          disabled={isPending}>
          {isPending && (
            <Loader2Icon
              className='size-4 animate-spin'
              aria-hidden='true'
            />
          )}
          Submit request
        </Button>
      </div>
    </form>
  );
};

export default RefundRequestForm;
