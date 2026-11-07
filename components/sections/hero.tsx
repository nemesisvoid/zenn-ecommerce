import { getActiveBanners } from '@/actions/banner.actions';
import HeroSlider from '../misc/hero-slider';

const HeroSection = async () => {
  const banners = await getActiveBanners();

  return (
    <section aria-label='Featured collections'>
      <HeroSlider banners={banners} />
    </section>
  );
};

export default HeroSection;
