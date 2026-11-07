import { notFound } from 'next/navigation';
import { getBannerById } from '@/actions/banner.actions';
import BannerForm from '@/components/admin/banners/banner-form';

export const dynamic = 'force-dynamic';

const EditBannerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();

  return (
    <div>
      <h1 className='mb-6 text-xl font-semibold text-foreground'>Edit banner</h1>
      <BannerForm initialData={banner} />
    </div>
  );
};

export default EditBannerPage;
