import { auth } from '@/auth';
import { getWishlistIds } from '@/actions/wishlist.actions';
import CtaSection from '@/components/shared/cta-section';
import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';
import { WishlistProvider } from '@/components/wishlist/wishlist-provider';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const wishlistIds = session?.user.id ? await getWishlistIds() : [];

  return (
    <WishlistProvider
      initialIds={wishlistIds}
      isLoggedIn={!!session?.user.id}>
      <div className='store-shell'>
        <Navbar />
        <main className='flex-1 pb-24 pt-6 md:pt-10'>{children}</main>
        <CtaSection />
        <Footer />
      </div>
    </WishlistProvider>
  );
}
