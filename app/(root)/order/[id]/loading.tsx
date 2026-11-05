import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading your order'
      className='container'>
      <div className='mx-auto max-w-2xl'>
        <div className='flex flex-col items-center'>
          <Shimmer className='size-14 rounded-full' />
          <Shimmer className='mt-6 h-11 w-80 max-w-full rounded-lg' />
          <Shimmer className='mt-4 h-4 w-72 max-w-full rounded-full' />
        </div>
        <div className='panel mt-10 p-6 md:p-8'>
          <div className='grid gap-6 border-b border-border pb-6 sm:grid-cols-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Shimmer className='h-3.5 w-28 rounded-full' />
                <Shimmer className='mt-3 h-4 w-40 rounded-full' />
              </div>
            ))}
          </div>
          <div className='space-y-4 pt-6'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-4'>
                <Shimmer className='aspect-[4/5] w-16 shrink-0 rounded-lg' />
                <div className='flex-1'>
                  <Shimmer className='h-4 w-1/2 rounded-full' />
                  <Shimmer className='mt-2.5 h-3.5 w-24 rounded-full' />
                </div>
                <Shimmer className='h-4 w-16 rounded-full' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadingScreen>
  );
}
