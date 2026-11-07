import { getCart } from '@/actions/cart.actions';
import { auth } from '@/auth';

import { redirect } from 'next/navigation';
import { loginUrlFor } from '@/routes';
import Link from 'next/link';
import { LockIcon } from 'lucide-react';
import { refreshCart } from '@/lib/cart';
import EmptyState from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { PaymentForm } from '@/components/misc/payment-form';
import { renderProduct } from '@/helper/utils';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';

const CheckoutPage = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id)
    return (
      <div className='container'>
        <EmptyState
          icon={LockIcon}
          title='Sign in to check out'
          description='You need an account to place an order. Your bag will be kept.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href={loginUrlFor('/checkout')}>Sign in</Link>
          </Button>
        </EmptyState>
      </div>
    );

  const existing = await getCart();
  if (existing) await refreshCart(existing.id);
  const cart = existing ? await getCart() : existing;

  if (!cart || cart.cartItems.length === 0) return redirect('/cart');

  const selectedProducts = renderProduct(cart.cartItems);
  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Bag', href: '/cart' }, { label: 'Checkout' }]}
        className='mb-6'
      />

      <h1 className='page-title mb-8 md:mb-10'>Checkout</h1>
      <PaymentForm
        user={{
          id: user?.id,
          name: user?.name,
          email: user?.email,
        }}
        selectedProducts={selectedProducts}
        cart={cart}
      />
    </div>
  );
};

export default CheckoutPage;
