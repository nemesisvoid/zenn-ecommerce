import { cn } from '@/lib/utils';

/** A single shimmering placeholder block. Size it with className. */
export const Shimmer = ({ className }: { className?: string }) => (
  <div
    aria-hidden='true'
    className={cn('skeleton', className)}
  />
);

/** Wraps a loading layout: announces it to screen readers and fades it in after a beat. */
export const LoadingScreen = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div
    role='status'
    aria-live='polite'
    aria-busy='true'
    className={cn('loading-enter', className)}>
    <span className='sr-only'>{label}</span>
    {children}
  </div>
);

export const BreadcrumbSkeleton = () => (
  <div className='mb-6 flex items-center gap-3'>
    <Shimmer className='h-3.5 w-12 rounded-full' />
    <Shimmer className='h-3.5 w-16 rounded-full' />
  </div>
);

export const PageHeaderSkeleton = ({ withDescription = false }: { withDescription?: boolean }) => (
  <div className='mb-10 flex flex-col gap-3 border-b border-border pb-8 md:flex-row md:items-end md:justify-between'>
    <div className='w-full max-w-md'>
      <Shimmer className='h-11 w-3/4 rounded-lg md:h-12' />
      {withDescription && <Shimmer className='mt-4 h-4 w-full rounded-full' />}
    </div>
    <Shimmer className='h-4 w-20 rounded-full' />
  </div>
);

export const ProductCardSkeleton = () => (
  <div>
    <Shimmer className='aspect-[4/5] w-full rounded-2xl' />
    <div className='px-1 pt-4'>
      <Shimmer className='h-4 w-3/4 rounded-full' />
      <Shimmer className='mt-2.5 h-4 w-1/3 rounded-full' />
    </div>
  </div>
);

/** Mirrors ProductList's container-query grid so nothing jumps when products arrive. */
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className='@container'>
    <div className='grid grid-cols-2 gap-x-4 gap-y-10 @2xl:grid-cols-3 @5xl:grid-cols-4 md:gap-x-6'>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const SummarySkeleton = ({ rows = 2 }: { rows?: number }) => (
  <div className='panel h-fit p-6'>
    <Shimmer className='h-5 w-36 rounded-full' />
    <div className='mt-6 space-y-4 border-b border-border pb-5'>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className='flex justify-between'>
          <Shimmer className='h-4 w-20 rounded-full' />
          <Shimmer className='h-4 w-16 rounded-full' />
        </div>
      ))}
    </div>
    <div className='flex justify-between pt-5'>
      <Shimmer className='h-5 w-14 rounded-full' />
      <Shimmer className='h-6 w-24 rounded-full' />
    </div>
    <Shimmer className='mt-6 h-12 w-full rounded-full' />
  </div>
);
