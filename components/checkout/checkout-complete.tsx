'use client';

import { verifyPayment } from '@/actions/payments.action';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

const CheckoutComplete = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const search = useSearchParams();
  const [message, setMessage] = useState('');

  const ref = search.get('reference') ?? null;
  console.log(ref);

  useEffect(() => {
    if (!ref) {
      setMessage('No payment reference found in url.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyPayment(ref);
        console.log('res:', res);
        if (res?.success) {
          setMessage('Payment successful! Thank you for your purchase. Redirection to order confirmation page....');

          setTimeout(() => {
            router.push(`/order/${res?.order?.id}`);
          }, 1000);
        } else {
          setMessage(`Payment verification failed: ${res?.message}`);
          console.log('response:', res);

          if (res?.order?.id) {
            setTimeout(() => {
              router.push(`/order/${res?.order?.id}`);
            }, 2000);
          }
        }
      } catch (err) {
        console.log(err);
        setMessage('An error occurred during payment verification. Please check your order page.');
      }
    });
  }, [ref, router]);

  return (
    <div className=''>
      <h2 className='text-2xl font-medium text-center'>Processing Payment....</h2>

      <p>{isPending ? 'Verifying payment - please wait...' : message ?? 'Verifying'}</p>
    </div>
  );
};

export default CheckoutComplete;
