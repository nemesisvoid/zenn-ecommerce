import CtaSection from '@/components/shared/cta-section';
import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='store-shell'>
      <Navbar />
      <main className='flex-1 pb-24 pt-6 md:pt-10'>{children}</main>
      <CtaSection />
      <Footer />
    </div>
  );
}
