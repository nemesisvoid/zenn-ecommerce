import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

// Mirrors the activity log layout: header, filter bar, then a feed of entries.
const block = 'bg-black/[0.06] dark:bg-white/[0.06]';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading activity log'
      className='space-y-5 pt-3'>
      <div className='flex items-end justify-between gap-4'>
        <div className='space-y-2'>
          <Shimmer className={`h-7 w-40 rounded-lg ${block}`} />
          <Shimmer className={`h-3.5 w-72 max-w-[60vw] rounded-full ${block}`} />
        </div>
        <Shimmer className={`h-8 w-28 rounded-md ${block}`} />
      </div>

      <div className='overflow-hidden rounded-lg bg-white shadow-md dark:bg-[#282F36]'>
        <div className='flex flex-col gap-3 border-b border-black/5 px-4 py-4 sm:px-6 md:flex-row dark:border-white/10'>
          <Shimmer className={`h-9 flex-1 rounded-md ${block}`} />
          <div className='grid grid-cols-2 gap-3 md:flex'>
            <Shimmer className={`h-9 rounded-md md:w-40 ${block}`} />
            <Shimmer className={`h-9 rounded-md md:w-40 ${block}`} />
          </div>
        </div>

        <div className='divide-y divide-black/5 dark:divide-white/10'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className='flex gap-4 px-4 py-4 sm:px-6'>
              <Shimmer className={`size-10 shrink-0 rounded-full ${block}`} />
              <div className='flex-1 space-y-2.5'>
                <Shimmer className={`h-4 w-3/4 max-w-md rounded-full ${block}`} />
                <div className='flex gap-2'>
                  <Shimmer className={`h-5 w-16 rounded-full ${block}`} />
                  <Shimmer className={`h-5 w-20 rounded-full ${block}`} />
                </div>
              </div>
              <Shimmer className={`hidden h-8 w-28 rounded-md sm:block ${block}`} />
            </div>
          ))}
        </div>
      </div>
    </LoadingScreen>
  );
}
