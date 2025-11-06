'use client';

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  console.log('err', error);
  return (
    <div className='ming-h-screen flex flex-col items-center justify-center mt-20'>
      <h1 className='text-3xl font-bold text-red-600 mb-2'>Something went wrong</h1>
      <p className='mb-4'>It looks like our database isn’t responding right now.</p>
      <button
        onClick={() => reset()}
        className='px-4 py-2 w-1/3 bg-gray-200 text-white rounded-md hover:cursor-pointer hover:bg-gray-300'>
        Try again
      </button>
    </div>
  );
};

export default Error;
