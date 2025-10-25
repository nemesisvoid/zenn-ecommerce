import Link from 'next/link';

import { getCart, getCartItems } from '@/actions/cart.actions';
import { auth } from '@/auth';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { redirect } from 'next/navigation';
import { PaymentForm } from '@/components/misc/payment-form';

const CheckoutPage = async () => {
  const session = await auth();
  const cart = await getCart();
  const user = session?.user;

  if (!cart || cart.cartItems.length === 0) return redirect('/cart');

  cart.cartItems.map(item => console.log(item));

  console.log('cart', cart);
  return (
    <div className='container'>
      <Breadcrumb className='mb-8'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={'/'}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={'/cart'}>Cart</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h2 className='text-2xl font-medium mb-10'>Checkout</h2>
        <div>
          <PaymentForm
            user={{
              id: user?.id,
              name: user?.name,
              email: user?.email,
            }}
            cart={cart}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
