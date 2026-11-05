import { getCart, getCartItems } from '@/actions/cart.actions';
import { auth } from '@/auth';
import CartDetails from '@/components/cart/cart-details';
import EmptyState from '@/components/shared/empty-state';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon } from 'lucide-react';

import Link from 'next/link';

const CartPage = async () => {
  const cart = await getCart();

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
  const cartItems = await getCartItems();

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Bag' }]}
        className='mb-6'
      />

      <CartDetails
        cart={cart}
        cartItems={cartItems
          ?.filter(item => item.cartId !== null)
          .map(item => ({
            ...item,
            cartId: item.cartId as string,
          }))}
      />
    </div>
  );
};

export default CartPage;
