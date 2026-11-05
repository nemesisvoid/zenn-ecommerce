import { getCart, getCartItems } from '@/actions/cart.actions';
import { auth } from '@/auth';

import { redirect } from 'next/navigation';
import { PaymentForm } from '@/components/misc/payment-form';
import { renderProduct } from '@/helper/utils';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';

const CheckoutPage = async () => {
  const session = await auth();
  const cart = await getCart();
  const user = session?.user;

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
