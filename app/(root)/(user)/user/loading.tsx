import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

// Renders inside the account layout, so the page header and side menu stay put.
export default function Loading() {
  return (
    <LoadingScreen label='Loading your account'>
      <Shimmer className='h-6 w-32 rounded-full' />
      <Shimmer className='mt-2.5 mb-6 h-4 w-64 rounded-full' />
      <div className='panel p-6 md:p-8'>
        <div className='grid gap-5 md:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Shimmer className='h-3.5 w-24 rounded-full' />
              <Shimmer className='mt-2.5 h-11 w-full' />
            </div>
          ))}
        </div>
      </div>
    </LoadingScreen>
  );
}
