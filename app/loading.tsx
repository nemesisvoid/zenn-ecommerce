import Spinner from '@/components/shared/spinner';

// Last-resort fallback (e.g. the first load of a section, before its own layout renders).
// The storefront, auth and admin areas each have their own loading screens.
const Loading = () => {
  return (
    <div className='loading-enter flex h-dvh w-full items-center justify-center'>
      <Spinner
        className='size-7 text-muted-foreground'
        aria-label='Loading'
      />
    </div>
  );
};

export default Loading;
