import Link from 'next/link';
import { Button } from '../ui/button';
import { PackageSearchIcon } from 'lucide-react';
import EmptyState from '../shared/empty-state';

const ProductNotFound = () => {
  return (
    <div className='container'>
      <EmptyState
        icon={PackageSearchIcon}
        title='Product not found'
        description='This product may have been removed, or the link is incorrect.'>
        <Button
          asChild
          className='h-11 rounded-full px-6'>
          <Link href='/list'>Browse the shop</Link>
        </Button>
      </EmptyState>
    </div>
  );
};

export default ProductNotFound;
