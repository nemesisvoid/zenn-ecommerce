import CtaSection from '@/components/shared/cta-section';
import Footer from '@/components/shared/footer';
import Navbar from '@/components/shared/navbar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex flex-col gap-10 justify-between'>
      <Navbar />
      <main>{children}</main>
      <CtaSection />
      <Footer />
    </div>
  );
}
