'use client';
import Image from 'next/image';

import { formatCurrency } from '@/helper/utils';
import Link from 'next/link';

type ProductCardProps = {
  slug: string;
  name: string;
  coverImage: string;
  price: number;
  images: string[];
};

const ProductCard = ({ product }: { product: ProductCardProps }) => {
  // const [isImageLoaded, setIsImageLoaded] = useState(true);
  // const handleImageLoad = () => setIsImageLoaded(false);
  return (
    <Link href={`product/${product?.slug}`}>
      <div className='relative w-full h-72 aspect-square mb-4'>
        <Image
          src={product?.coverImage ? product?.coverImage : ''}
          fill
          alt={`${product?.name} image`}
          className='object-cover absolute w-full z-10  rounded-md hover:opacity-0 transition-opacity  duration-300'
          sizes='50vw'
        />
        <Image
          src={product?.images ? product?.images[0] : ''}
          fill
          sizes='50vw'
          alt={`${product?.name} image`}
          className='object-cover absolute w-full rounded-md'
        />
      </div>
      <div>
        <p className='text-xl mb-1'>{product?.name}</p>
        <p className='text-lg font-medium'>{formatCurrency(product?.price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
