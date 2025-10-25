import { Loader } from 'lucide-react';

const Loading = () => {
  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <Loader
        className='animate-spin'
        color='black'
        size={40}
      />
    </div>
  );
};

export default Loading;
