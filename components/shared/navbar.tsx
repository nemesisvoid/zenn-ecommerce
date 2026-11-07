import { auth } from '@/auth';
import NavLinks from './nav-links';
import SearchBar from './search-bar';
import UserNav from './user-nav';
import { getCart } from '@/actions/cart.actions';

const Navbar = async () => {
  const session = await auth();

  const cart = await getCart();
  const cartItemsCount = cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;

  const isLoggedIn = !!session;

  return (
    <header className='sticky top-0 z-40 border-b border-border'>
      {/* Blur lives on a separate layer: backdrop-filter on the header itself would trap the fixed mobile menu inside it. */}
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10 bg-background/80 backdrop-blur-xl'
      />
      <nav
        aria-label='Main'
        className='container flex h-16 items-center justify-between gap-4 md:h-[72px] md:gap-8'>
        <NavLinks />
        <SearchBar />
        <UserNav
          isLoggedIn={isLoggedIn}
          userRole={session?.user?.role}
          cartItemsCount={cartItemsCount}
        />
      </nav>
    </header>
  );
};

export default Navbar;
