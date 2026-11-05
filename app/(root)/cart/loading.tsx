import { BreadcrumbSkeleton, LoadingScreen, Shimmer, SummarySkeleton } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading your bag'
      className='container'>
      <BreadcrumbSkeleton />
      <div className='mb-8 flex items-end justify-between md:mb-10'>
        <Shimmer className='h-11 w-48 rounded-lg md:h-12' />
        <Shimmer className='h-4 w-14 rounded-full' />
      </div>
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10'>
        <div className='panel divide-y divide-border px-4 md:px-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='flex gap-4 py-5 md:gap-5 md:py-6'>
              <Shimmer className='aspect-[4/5] w-20 shrink-0 md:w-24' />
              <div className='flex flex-1 flex-col'>
                <Shimmer className='h-4 w-1/2 rounded-full' />
                <Shimmer className='mt-2.5 h-3.5 w-24 rounded-full' />
                <div className='mt-auto flex items-end justify-between pt-4'>
                  <Shimmer className='h-10 w-28 rounded-full' />
                  <Shimmer className='h-4 w-20 rounded-full' />
                </div>
              </div>
            </div>
          ))}
        </div>
        <SummarySkeleton />
      </div>
    </LoadingScreen>
  );
}
