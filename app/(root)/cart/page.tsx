import { getCart } from '@/actions/cart.actions';
import { getPricingSettings, refreshCart } from '@/lib/cart';
import CartDetails from '@/components/cart/cart-details';
import EmptyState from '@/components/shared/empty-state';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon } from 'lucide-react';

import Link from 'next/link';

const CartPage = async () => {
  // Re-price from current product data so the bag never shows stale or tampered prices.
  const existing = await getCart();
  if (existing) await refreshCart(existing.id);
  const cart = existing ? await getCart() : existing;

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className='container'>
        <EmptyState
          icon={ShoppingBagIcon}
          title='Your bag is empty'
          description='Items you add to your bag will show up here.'>
          <Button
            asChild
            className='h-11 rounded-full px-6'>
            <Link href='/list'>Start shopping</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const { freeShippingThreshold } = await getPricingSettings();

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Bag' }]}
        className='mb-6'
      />

      <CartDetails
        cart={cart}
        freeShippingThreshold={freeShippingThreshold}
      />
    </div>
  );
};

export default CartPage;
