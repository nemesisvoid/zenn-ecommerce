'use client';

import { useMemo, useState } from 'react';

import { ProductType } from '@/types';
import { formatCurrency, getPercentagePrice } from '@/helper/utils';
import { CheckIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';
import Link from 'next/link';
import ProductImages from './product-images';
import AddToCart from '../cart/add-to-cart';

type ProductVariantType = {
  product: ProductType;
};

// force dynamic

const ProductDetails = ({ product }: ProductVariantType) => {
  const hasVariants = product.variants.length > 0;

  const uniqueColors = useMemo(() => {
    return Array.from(new Set(product.colorImages.map(v => v.color).filter(Boolean)));
  }, [product.colorImages]);

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

  const priceToShow = hasVariants
    ? getPercentagePrice(selectedVariant?.price ?? product.price, product.discountPercent)
    : getPercentagePrice(product.price, product.discountPercent);

  const imagesToShow = product?.colorImages?.find(v => v.color === selectedColor)?.images || product.images;

  const category = product?.categories?.[0];

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16'>
      <ProductImages images={imagesToShow} />

      <div className='lg:sticky lg:top-28 lg:self-start'>
        <div className='border-b border-border pb-8'>
          {category && (
            <Link
              href={`/list?category=${category.slug}`}
              className='text-sm text-muted-foreground transition-colors hover:text-foreground'>
              {category.name}
            </Link>
          )}
          <h1 className='mt-2 font-display text-[2.5rem] leading-[1.05] tracking-tight text-foreground md:text-5xl'>{product?.name}</h1>
          {product?.price ? (
            <div className='mt-5'>
              {product.discountPercent ? (
                <div className='flex flex-wrap items-center gap-3'>
                  <p className='price text-2xl text-foreground'>{formatCurrency(priceToShow)}</p>
                  <p className='price text-lg text-muted-foreground line-through decoration-1'>
                    {formatCurrency(selectedVariant?.price ?? product.price)}
                  </p>
                  <span className='sale-badge'>−{product.discountPercent}%</span>
                </div>
              ) : (
                <p className='price text-2xl text-foreground'>{formatCurrency(priceToShow)}</p>
              )}
            </div>
          ) : (
            <p className='mt-5 text-lg text-muted-foreground'>Price not available</p>
          )}

          <p className='mt-6 max-w-prose text-base leading-relaxed text-muted-foreground'>{product?.description}</p>
        </div>

        {hasVariants && uniqueColors.length > 0 && (
          <fieldset className='border-b border-border py-6'>
            <legend className='sr-only'>Colour</legend>
            <p className='mb-4 text-sm font-medium text-foreground'>
              Colour <span className='font-normal capitalize text-muted-foreground'>{selectedColor}</span>
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              {uniqueColors.map(color => (
                <button
                  type='button'
                  key={color}
                  aria-label={color ?? 'colour'}
                  aria-pressed={selectedColor === color}
                  onClick={() => {
                    setSelectedColor(color);
                    if (!product.variants.find(v => v.color === color && v.size === selectedSize)) {
                      setSelectedSize(null);
                    }
                  }}
                  style={{ backgroundColor: color || '' }}
                  className={`relative size-9 cursor-pointer rounded-full border border-black/10 ring-offset-[3px] ring-offset-background transition-shadow dark:border-white/15 ${
                    selectedColor === color ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-border'
                  }`}>
                  {selectedColor === color && (
                    <CheckIcon
                      className='absolute inset-0 m-auto size-4 text-white mix-blend-difference'
                      aria-hidden='true'
                    />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {hasVariants && uniqueSizes.length > 0 && (
          <fieldset className='border-b border-border py-6'>
            <legend className='sr-only'>Size</legend>
            <p className='mb-4 text-sm font-medium text-foreground'>Size</p>

            <div className='flex flex-wrap items-center gap-2.5'>
              {uniqueSizes.map(size => (
                <button
                  type='button'
                  key={size}
                  aria-pressed={selectedSize === size}
                  disabled={!availableSizesForColor.includes(size)}
                  className={`h-11 min-w-14 cursor-pointer rounded-xl border px-4 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-input bg-card text-foreground hover:border-foreground'
                  } ${!availableSizesForColor.includes(size) ? 'cursor-not-allowed text-muted-foreground line-through opacity-50 hover:border-input' : ''}`}
                  onClick={() => setSelectedSize(size)}>
                  {size}
                </button>
              ))}
            </div>

            {hasVariants && !selectedSize && (
              <p
                role='status'
                className='mt-4 text-sm text-destructive'>
                Select a size to add this to your bag.
              </p>
            )}
          </fieldset>
        )}

        <div className='pt-8'>
          <AddToCart
            product={product}
            selectedVariant={selectedVariant}
            canAddToCart={canAddToCart}
          />
        </div>

        <ul className='mt-8 grid gap-4 rounded-2xl bg-secondary p-5 text-sm sm:grid-cols-2'>
          <li className='flex gap-3'>
            <TruckIcon
              className='mt-0.5 size-[18px] shrink-0 text-brand-ink'
              aria-hidden='true'
            />
            <span>
              <span className='block font-medium text-foreground'>Pay on delivery</span>
              <span className='text-muted-foreground'>Pay when your order arrives.</span>
            </span>
          </li>
          <li className='flex gap-3'>
            <ShieldCheckIcon
              className='mt-0.5 size-[18px] shrink-0 text-brand-ink'
              aria-hidden='true'
            />
            <span>
              <span className='block font-medium text-foreground'>Secure checkout</span>
              <span className='text-muted-foreground'>Card payments handled by Paystack.</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductDetails;
