import HeroSection from '@/components/sections/hero';
import NewArrivalsSection from '@/components/sections/new-arrivals-section';
import CategorySection from '@/components/sections/category-section';

export default async function Home() {
  return (
    <>
      <HeroSection />
      <NewArrivalsSection />
      <CategorySection />
      {/* <FeaturedSection /> */}
    </>
  );
}
