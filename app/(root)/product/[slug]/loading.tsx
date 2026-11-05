import { BreadcrumbSkeleton, LoadingScreen, Shimmer } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading product'
      className='container'>
      <BreadcrumbSkeleton />
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16'>
        <div className='flex flex-col gap-4 md:flex-row-reverse'>
          <Shimmer className='aspect-[4/5] w-full rounded-3xl' />
          <div className='flex gap-3 md:w-20 md:flex-col'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer
                key={i}
                className='aspect-[4/5] w-16 shrink-0 rounded-xl md:w-full'
              />
            ))}
          </div>
        </div>

        <div>
          <Shimmer className='h-4 w-24 rounded-full' />
          <Shimmer className='mt-4 h-12 w-11/12 rounded-lg' />
          <Shimmer className='mt-3 h-12 w-2/3 rounded-lg' />
          <Shimmer className='mt-6 h-7 w-40 rounded-full' />
          <div className='mt-7 space-y-2.5 border-b border-border pb-8'>
            <Shimmer className='h-4 w-full rounded-full' />
            <Shimmer className='h-4 w-full rounded-full' />
            <Shimmer className='h-4 w-3/4 rounded-full' />
          </div>
          <div className='border-b border-border py-6'>
            <Shimmer className='h-4 w-20 rounded-full' />
            <div className='mt-4 flex gap-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Shimmer
                  key={i}
                  className='size-9 rounded-full'
                />
              ))}
            </div>
          </div>
          <div className='border-b border-border py-6'>
            <Shimmer className='h-4 w-12 rounded-full' />
            <div className='mt-4 flex gap-2.5'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer
                  key={i}
                  className='h-11 w-14 rounded-xl'
                />
              ))}
            </div>
          </div>
          <Shimmer className='mt-8 h-13 w-full rounded-full' />
        </div>
      </div>
    </LoadingScreen>
  );
}
