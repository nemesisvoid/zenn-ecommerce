import { BreadcrumbSkeleton, LoadingScreen, PageHeaderSkeleton, ProductGridSkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading products'
      className='container'>
      <BreadcrumbSkeleton />
      <PageHeaderSkeleton />
      <ProductGridSkeleton />
    </LoadingScreen>
  );
}
