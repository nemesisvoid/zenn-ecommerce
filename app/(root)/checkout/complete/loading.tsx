import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading'
      className='container py-8 md:py-12'>
      <div className='panel mx-auto flex max-w-lg flex-col items-center px-6 py-14'>
        <Shimmer className='size-14 rounded-2xl' />
        <Shimmer className='mt-6 h-9 w-72 max-w-full rounded-lg' />
        <Shimmer className='mt-4 h-4 w-60 max-w-full rounded-full' />
      </div>
    </LoadingScreen>
  );
}
