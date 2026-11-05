import { LoadingScreen, ProductGridSkeleton, Shimmer } from '@/components/shared/skeletons';

// Home (and any storefront route without its own loading screen).
export default function Loading() {
  return (
    <LoadingScreen label='Loading the store'>
      <div className='container grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16'>
        <div className='order-2 lg:order-1'>
          <Shimmer className='h-14 w-4/5 rounded-xl sm:h-20' />
          <Shimmer className='mt-3 h-14 w-3/5 rounded-xl sm:h-20' />
          <Shimmer className='mt-8 h-5 w-full max-w-sm rounded-full' />
          <Shimmer className='mt-9 h-12 w-36 rounded-full' />
        </div>
        <Shimmer className='order-1 aspect-[4/3] w-full rounded-3xl sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:h-[min(72vh,680px)]' />
      </div>

      <div className='container mt-24 md:mt-32'>
        <Shimmer className='mb-3 h-10 w-56 rounded-lg' />
        <Shimmer className='mb-10 h-4 w-64 rounded-full' />
        <ProductGridSkeleton count={4} />
      </div>
    </LoadingScreen>
  );
}
