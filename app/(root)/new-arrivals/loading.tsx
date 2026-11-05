import { BreadcrumbSkeleton, LoadingScreen, PageHeaderSkeleton, ProductGridSkeleton, Shimmer } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading new arrivals'
      className='container'>
      <BreadcrumbSkeleton />
      <PageHeaderSkeleton withDescription />
      <Shimmer className='mb-6 h-8 w-40 rounded-lg' />
      <ProductGridSkeleton />
    </LoadingScreen>
  );
}
