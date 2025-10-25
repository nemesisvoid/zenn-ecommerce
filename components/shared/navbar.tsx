import { auth } from '@/auth';
import NavLinks from './nav-links';
import SearchBar from './search-bar';
import UserNav from './user-nav';
import { getCart } from '@/actions/cart.actions';

const Navbar = async () => {
  const session = await auth();

  const cart = await getCart();
  const cartItemsCount = cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;

  console.log('cartItemsCount', cartItemsCount);

  const isLoggedIn = !!session;

  return (
    <nav className='container py-8 px-8'>
      <div className='flex items-center justify-between mx-auto'>
        <NavLinks />
        <SearchBar />
        <UserNav
          isLoggedIn={isLoggedIn}
          cart={cartItemsCount}
          cartItemsCount={cartItemsCount}
        />
      </div>
    </nav>
  );
};

export default Navbar;
