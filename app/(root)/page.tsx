import HeroSection from '@/components/sections/hero';
import FeaturedSection from '@/components/sections/featured-section';
import NewArrivalsSection from '@/components/sections/new-arrivals-section';

import { getAllCategories } from '@/actions/category.actions';
import CategorySection from '@/components/sections/category-section';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();
  console.log('session:', session);
  const cat = await getAllCategories();
  console.log(cat);
  return (
    <>
      <HeroSection />
      <NewArrivalsSection />
      <CategorySection />
      <FeaturedSection />
    </>
  );
}
