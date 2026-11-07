'use server';

import { applyPaystackPayment, fetchPaystackTransaction } from '@/lib/payments';

// Called by the checkout-complete page when the customer returns from Paystack.
// The result is double-checked with Paystack directly; only the order id is returned to the browser.
export const verifyPayment = async (reference: string) => {
  if (!reference) return { success: false, message: 'Missing payment reference' };

  try {
    const tx = await fetchPaystackTransaction(reference);
    if (!tx) return { success: false, message: 'Could not confirm the payment with Paystack' };

    const result = await applyPaystackPayment(tx);
    if (!result.ok) return { success: false, message: result.message, orderId: result.orderId };

    return { success: true, message: result.alreadyPaid ? 'Order already paid' : 'Payment verified', orderId: result.orderId };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, message: 'Something went wrong verifying your payment' };
  }
};
