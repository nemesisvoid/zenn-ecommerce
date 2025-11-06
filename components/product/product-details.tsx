'use client';

import { useMemo, useState } from 'react';

import { CartType, ProductType } from '@/types';
import { formatCurrency, getPercentagePrice } from '@/helper/utils';
import { CheckIcon } from 'lucide-react';
import ProductImages from './product-images';
import AddToCart from '../cart/add-to-cart';

type ProductVariantType = {
  product: ProductType;
  cart: CartType | undefined;
};

const ProductDetails = ({ product, cart }: ProductVariantType) => {
  const hasVariants = product.variants.length > 0;

  const uniqueColors = useMemo(() => {
    return Array.from(new Set(product.variants.map(v => v.color).filter(Boolean)));
  }, [product.variants]);

  const uniqueSizes = useMemo(() => {
    return Array.from(new Set(product.variants.map(v => v.size).filter(Boolean)));
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState(uniqueColors.length ? uniqueColors[0] : null);

  const [selectedSize, setSelectedSize] = useState(uniqueSizes.length ? uniqueSizes[0] : null);

  const variantsByColor = useMemo(() => {
    return product.variants.filter(v => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  const availableSizesForColor = useMemo(() => {
    return variantsByColor.map(v => v.size);
  }, [variantsByColor]);

  const selectedVariant = useMemo(() => {
    // For products without variants, do not fabricate a variant.
    // Keep this null so the server does not attempt a variant lookup.
    if (!hasVariants) return null;

    const foundVariant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);

    if (foundVariant && foundVariant.price !== null && foundVariant.price !== undefined) {
      return {
        id: foundVariant.id,
        productId: foundVariant.productId,
        price: foundVariant.price,
      };
    }

    return null;
  }, [selectedColor, selectedSize, product, hasVariants]);

  const canAddToCart = !hasVariants || !!selectedVariant;

  const priceToShow = selectedVariant
    ? product.discountPercent
      ? getPercentagePrice(selectedVariant.price ?? product.price, product.discountPercent)
      : selectedVariant.price ?? product.price
    : product.price;

  const imagesToShow = product?.variants?.find(v => v.color === selectedColor)?.images || product.images;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      <ProductImages images={imagesToShow} />

      <div className='lg:ml-10'>
        <div className='border-b border-gray-300 pb-6'>
          <h2 className='text-4xl font-semibold mb-4'>{product?.name}</h2>
          {product?.price ? (
            <div className='text-2xl font-medium mb-6'>
              {product.discountPercent ? (
                <div className='flex items-center gap-4'>
                  <p>{formatCurrency(priceToShow)}</p>
                  <p className='text-gray-300 line-through'>{formatCurrency(selectedVariant?.price ?? product.price)}</p>
                  <div className='text-lg bg-red-200 text-red-500 rounded-2xl w-20 h-10 flex items-center justify-center px-8 py-2'>
                    -{product.discountPercent}%
                  </div>
                </div>
              ) : (
                <p>{formatCurrency(priceToShow)}</p>
              )}
            </div>
          ) : (
            <p className='text-2xl'>Price not available</p>
          )}

          <p className='text-lg'>{product?.description}</p>
        </div>

        {hasVariants && uniqueColors.length > 0 && (
          <div className='my-5 border-b border-gray-300 pb-6'>
            <p className='mb-4'>Select Color</p>
            <div className='flex items-center gap-4'>
              {uniqueColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    if (!product.variants.find(v => v.color === color && v.size === selectedSize)) {
                      setSelectedSize(null);
                    }
                  }}
                  style={{ backgroundColor: color || '' }}
                  className='relative w-8 h-8 rounded-full border border-gray-400 cursor-pointer'>
                  <div>
                    {selectedColor === color && (
                      <div className='absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5'>
                        <CheckIcon
                          color='green'
                          size={13}
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasVariants && uniqueSizes.length > 0 && (
          <div className='my-5 border-b border-gray-300 pb-6'>
            <p>Select Sizes</p>

            <div className='flex items-center gap-4 mt-4'>
              {uniqueSizes.map(size => (
                <button
                  key={size}
                  disabled={!availableSizesForColor.includes(size)}
                  className={`w-14 h-10 text-black rounded-md border cursor-pointer transition ${
                    selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-500 hover:bg-black hover:text-white'
                  } ${!availableSizesForColor.includes(size) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setSelectedSize(size)}>
                  <p>{size}</p>
                </button>
              ))}
            </div>

            {hasVariants && !selectedSize && <p className='text-red-500 my-4'>Please select size</p>}
          </div>
        )}

        <div className={`${!hasVariants ? 'mt-10' : ''}`}>
          <AddToCart
            cart={cart}
            product={product}
            selectedVariant={selectedVariant}
            canAddToCart={canAddToCart}
            price={priceToShow}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
