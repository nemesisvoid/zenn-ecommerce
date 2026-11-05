'use client';
import Image from 'next/image';

import { formatCurrency, getPercentagePrice } from '@/helper/utils';
import Link from 'next/link';
import FadeImage from '../shared/fade-image';

type ProductCardProps = {
  slug: string;
  name: string;
  coverImage: string;
  price: number;
  images: string[];
  discountPercent?: number | null;
};

const ProductCard = ({ product }: { product: ProductCardProps }) => {
  // const [isImageLoaded, setIsImageLoaded] = useState(true);
  // const handleImageLoad = () => setIsImageLoaded(false);
  const primaryImage = product?.images ? product.images[0] : product.images[1];
  const hoverImage = product?.images ? product?.images[1] : product?.images[0];
  const discount = product?.discountPercent ?? 0;
  const salePrice = getPercentagePrice(product?.price, discount);

  return (
    <Link
      href={`product/${product?.slug}`}
      className='group flex flex-col rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'>
      <div className='skeleton relative aspect-[4/5] w-full rounded-2xl'>
        {primaryImage && (
          <FadeImage
            src={primaryImage}
            fill
            alt={`${product?.name} image`}
            className='z-10 object-cover group-hover:scale-[1.03]'
            sizes='(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw'
          />
        )}
        {hoverImage && hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            fill
            sizes='(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw'
            alt=''
            className='z-20 object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none'
          />
        )}
        {discount > 0 && <span className='sale-badge absolute left-3 top-3 z-30'>−{discount}%</span>}
      </div>
      <div className='flex flex-col gap-1 px-1 pt-4'>
        <p className='truncate text-[0.9375rem] font-medium text-foreground'>{product?.name}</p>
        <div className='flex items-baseline gap-2'>
          <p className='price text-[0.9375rem] text-foreground'>{formatCurrency(salePrice)}</p>
          {discount > 0 && <p className='price text-sm text-muted-foreground line-through decoration-1'>{formatCurrency(product?.price)}</p>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
