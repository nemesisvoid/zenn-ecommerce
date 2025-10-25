import crypto from 'crypto';

export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();

  console.log('rawBody:', rawBody);
  const raw = Buffer.from(rawBody);
  console.log('raw:', raw);
  const signatures = req.headers.get('x-paystack-signature');

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
    .update(raw)
    .digest('hex');

  if (signatures !== hash) {
    console.warn('Invalid paystack signature');
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(raw.toString('utf-8'));
  console.log('event webhook:', event);

  if (event.event === 'charge.success') {
    const data = event.data;
    const ref = data.reference;

    try {
      const order = await prisma?.order.findUnique({
        where: { paystackReference: ref },
      });

      if (!order) {
        console.warn('Order not found');
        return new Response('Order not found', { status: 400 });
      }

      if (order.status !== 'PAID') {
        await prisma?.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            isPaid: true,
          },
        });
      }

      // await prisma?.product.update({
      //   where: { id: order.productId },
      //   data: { stock: { decrement: item.quantity } },
      // });

      await prisma?.cartItem.deleteMany({
        where: { cartId: order.cartId },
      });
    } catch (err) {
      console.log('webhook err:', err);
      return new Response('Error updating order', { status: 500 });
    }
    return new Response('OK', { status: 200 });
  }
}
