import { BreadcrumbSkeleton, LoadingScreen, Shimmer, SummarySkeleton } from '@/components/shared/skeletons';

const SectionSkeleton = ({ fields }: { fields: number }) => (
  <div className='panel p-6 md:p-8'>
    <Shimmer className='h-5 w-32 rounded-full' />
    <div className='mt-6 grid gap-5 sm:grid-cols-2'>
      {Array.from({ length: fields }).map((_, i) => (
        <div
          key={i}
          className={i === 0 ? 'sm:col-span-2' : undefined}>
          <Shimmer className='h-3.5 w-24 rounded-full' />
          <Shimmer className='mt-2.5 h-11 w-full' />
        </div>
      ))}
    </div>
  </div>
);

export default function Loading() {
  return (
    <LoadingScreen
      label='Loading checkout'
      className='container'>
      <BreadcrumbSkeleton />
      <Shimmer className='mb-8 h-11 w-44 rounded-lg md:mb-10 md:h-12' />
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10'>
        <div className='space-y-6'>
          <SectionSkeleton fields={3} />
          <SectionSkeleton fields={4} />
        </div>
        <SummarySkeleton />
      </div>
    </LoadingScreen>
  );
}
