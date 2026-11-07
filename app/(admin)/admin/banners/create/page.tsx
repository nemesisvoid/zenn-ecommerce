import { getAllBanners } from '@/actions/banner.actions';
import BannerForm from '@/components/admin/banners/banner-form';

export const dynamic = 'force-dynamic';

const CreateBannerPage = async () => {
  const banners = await getAllBanners();
  const nextSortOrder = banners.length ? Math.max(...banners.map(b => b.sortOrder)) + 1 : 0;

  return (
    <div>
      <h1 className='mb-6 text-xl font-semibold text-foreground'>New banner</h1>
      <BannerForm nextSortOrder={nextSortOrder} />
    </div>
  );
};

export default CreateBannerPage;
