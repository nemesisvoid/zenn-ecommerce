import crypto from 'crypto';
import { applyPaystackPayment, type PaystackTransaction } from '@/lib/payments';
import { handlePaystackRefundEvent } from '@/lib/refunds';

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('Paystack webhook: PAYSTACK_SECRET_KEY is not configured');
    return new Response('Not configured', { status: 500 });
  }

  const raw = Buffer.from(await req.arrayBuffer());
  const signature = Buffer.from(req.headers.get('x-paystack-signature') ?? '');
  const expected = Buffer.from(crypto.createHmac('sha512', secret).update(raw).digest('hex'));

  if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) {
    console.warn('Paystack webhook: invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  // charge.* events carry a transaction; refund.* events add the original payment's transaction_reference.
  const event = JSON.parse(raw.toString('utf-8')) as { event: string; data: PaystackTransaction & { transaction_reference?: string } };

  // refund.pending / processing / processed / failed / needs-attention
  if (event.event.startsWith('refund.')) {
    try {
      await handlePaystackRefundEvent(event.data);
      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('Paystack refund webhook error:', err);
      return new Response('Error', { status: 500 });
    }
  }

  // Acknowledge events we don't act on, so Paystack doesn't keep retrying them.
  if (event.event !== 'charge.success') return new Response('Ignored', { status: 200 });

  try {
    const result = await applyPaystackPayment(event.data);
    if (!result.ok) console.warn(`Paystack webhook: ${event.data.reference}: ${result.message}`);
    // 200 either way: the event was received and handled; retrying won't change the outcome.
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Paystack webhook error:', err);
    // Non-200 so Paystack retries later (e.g. a temporary database error).
    return new Response('Error', { status: 500 });
  }
}
