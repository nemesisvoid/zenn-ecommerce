import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

// Renders inside the admin layout, so the sidebar and top bar stay put while a page loads.
// Placeholders are tinted to read on the admin's own background colours.
const block = 'bg-black/[0.06] dark:bg-white/[0.06]';
const surface = 'rounded-lg bg-white dark:bg-[#282F36]';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading'
      className='space-y-6 pt-2'>
      <div className='flex items-center justify-between gap-4'>
        <Shimmer className={`h-8 w-48 rounded-lg ${block}`} />
        <Shimmer className={`h-9 w-32 rounded-md ${block}`} />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${surface} p-5`}>
            <Shimmer className={`h-3.5 w-24 rounded-full ${block}`} />
            <Shimmer className={`mt-4 h-7 w-32 rounded-md ${block}`} />
            <Shimmer className={`mt-3 h-3 w-20 rounded-full ${block}`} />
          </div>
        ))}
      </div>

      <div className={`${surface} p-5`}>
        <div className='flex items-center justify-between gap-4 pb-5'>
          <Shimmer className={`h-5 w-40 rounded-full ${block}`} />
          <Shimmer className={`h-9 w-56 rounded-md ${block}`} />
        </div>
        <div className='divide-y divide-black/5 dark:divide-white/5'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center gap-4 py-3.5'>
              <Shimmer className={`size-10 shrink-0 rounded-md ${block}`} />
              <Shimmer className={`h-4 flex-1 rounded-full ${block}`} />
              <Shimmer className={`hidden h-4 w-24 rounded-full sm:block ${block}`} />
              <Shimmer className={`h-6 w-20 rounded-full ${block}`} />
            </div>
          ))}
        </div>
      </div>
    </LoadingScreen>
  );
}
