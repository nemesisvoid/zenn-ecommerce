'use client';

import { verifyPayment } from '@/actions/payments.action';
import { ReceiptTextIcon } from 'lucide-react';
import Spinner from '@/components/shared/spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

const CheckoutComplete = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const search = useSearchParams();
  const [message, setMessage] = useState('');

  const ref = search.get('reference') ?? null;

  useEffect(() => {
    if (!ref) {
      setMessage('No payment reference found');
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyPayment(ref);
        if (res?.success) {
          setMessage('Payment successful! Thank you for your purchase. Redirection to order confirmation page....');

          setTimeout(() => {
            router.push(`/order/${res?.orderId}`);
          }, 1000);
        } else {
          setMessage(`Payment verification failed: ${res?.message}`);

          if (res?.orderId) {
            setTimeout(() => {
              router.push(`/order/${res?.orderId}`);
            }, 2000);
          }
        }
      } catch (err) {
        console.error(err);
        setMessage('An error occurred during payment verification. Please check your order page.');
      }
    });
  }, [ref, router]);

  const verifying = isPending || !message;

  return (
    <div className='panel mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center md:px-10'>
      <span className='flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground'>
        {verifying ? (
          <Spinner
            className='size-6'
            aria-hidden='true'
          />
        ) : (
          <ReceiptTextIcon
            className='size-6'
            aria-hidden='true'
          />
        )}
      </span>
      <h1 className='mt-6 font-display text-3xl tracking-tight text-foreground md:text-4xl'>
        {verifying ? 'Confirming your payment' : 'Payment status'}
      </h1>
      <p
        className='lede mt-3 max-w-sm'
        aria-live='polite'>
        {verifying ? 'This only takes a moment. Please keep this page open.' : message}
      </p>
    </div>
  );
};

export default CheckoutComplete;
