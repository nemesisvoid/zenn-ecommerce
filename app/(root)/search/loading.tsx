import { LoadingScreen, PageHeaderSkeleton, ProductGridSkeleton, Shimmer } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Searching products'
      className='container'>
      <PageHeaderSkeleton />
      <div className='flex flex-col gap-8 md:flex-row lg:gap-12'>
        <div className='w-full flex-shrink-0 md:w-60 lg:w-64'>
          <Shimmer className='h-11 w-full rounded-full md:hidden' />
          <div className='hidden space-y-5 md:block'>
            <Shimmer className='h-4 w-16 rounded-full' />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3'>
                <Shimmer className='size-4 rounded' />
                <Shimmer className='h-4 w-28 rounded-full' />
              </div>
            ))}
            <Shimmer className='h-2 w-full rounded-full' />
          </div>
        </div>
        <div className='min-w-0 flex-1'>
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </LoadingScreen>
  );
}
