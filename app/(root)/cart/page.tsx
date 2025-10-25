import { getCart, getCartItems } from '@/actions/cart.actions';
import { auth } from '@/auth';
import CartDetails from '@/components/cart/cart-details';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

const CartPage = async () => {
  const session = await auth();
  console.log(session);

  const cart = await getCart();

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className='text-center flex flex-col items-center justify-center min-h-[60vh] gap-6'>
        Your cart is empty, please add some products
        <Link href='/'>Back to Home</Link>
      </div>
    );
  }
  const cartItems = await getCartItems();
  console.log('cartItems', cartItems);

  console.log('cart page:', cart);
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
            <BreadcrumbPage>Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
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

      {JSON.stringify(session)}
    </div>
  );
};

export default CartPage;
