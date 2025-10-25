import Link from 'next/link';
import { Button } from '../ui/button';
import { AlertTriangleIcon, ArrowLeft } from 'lucide-react';

const ProductNotFound = () => {
  return (
    <div className=' h-[60vh] flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='flex items-center gap-2 text-2xl font-medium '>
          Product not found
          <AlertTriangleIcon
            color='red'
            size={30}
          />
        </div>

        <p>We couldn&apos;t find the product you were looking for :(</p>
        <Button
          className='text-2xl w-fit py-7 px-6 mt-10 rounded-sm'
          variant='default'
          asChild>
          <Link href='/'>
            Back To Home <ArrowLeft className='' />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductNotFound;
