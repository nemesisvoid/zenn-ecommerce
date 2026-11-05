import { LoadingScreen, Shimmer } from '@/components/shared/skeletons';

// Renders inside the auth layout, so the artwork and theme toggle stay put and only the modal's contents shimmer.
export default function Loading() {
  return (
    <LoadingScreen
      label='Loading'
      className='flex w-full justify-center'>
      <div className='auth-modal'>
        <aside className='auth-aside'>
          <div>
            <Shimmer className='h-20 w-48 rounded-2xl' />
            <Shimmer className='mt-6 h-5 w-64 rounded-full' />
            <Shimmer className='mt-2.5 h-5 w-48 rounded-full' />
          </div>
          <div className='space-y-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex gap-4'>
                <Shimmer className='size-10 shrink-0 rounded-lg' />
                <div className='flex-1'>
                  <Shimmer className='h-4 w-32 rounded-full' />
                  <Shimmer className='mt-2 h-3.5 w-full rounded-full' />
                </div>
              </div>
            ))}
          </div>
          <Shimmer className='h-4 w-28 rounded-full' />
        </aside>

        <section className='auth-panel'>
          <Shimmer className='h-10 w-24 rounded-xl lg:hidden' />
          <div>
            <Shimmer className='h-10 w-56 rounded-xl' />
            <Shimmer className='mt-3 h-4 w-64 max-w-full rounded-full' />
          </div>
          <div className='space-y-5'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Shimmer className='h-3.5 w-20 rounded-full' />
                <Shimmer className='mt-2.5 h-11 w-full rounded-lg' />
              </div>
            ))}
            <Shimmer className='h-11 w-full rounded-lg' />
          </div>
          <Shimmer className='h-11 w-full rounded-lg' />
          <div className='flex justify-center border-t border-border pt-6'>
            <Shimmer className='h-4 w-52 rounded-full' />
          </div>
        </section>
      </div>
    </LoadingScreen>
  );
}
