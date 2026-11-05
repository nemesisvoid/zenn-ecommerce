'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import FadeImage from '../shared/fade-image';

const ProductImages = ({ images }: { images: string[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handleCurrentImage = (image: number) => {
    setCurrentImageIndex(image);
  };

  // Images change when a different colour is picked; fall back to the first one.
  const current = images[currentImageIndex] ?? images[0];

  return (
    <div className='flex flex-col gap-4 md:flex-row-reverse'>
      <div className='skeleton relative aspect-[4/5] w-full rounded-3xl'>
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className='absolute inset-0 z-10'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.45, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            {current && (
              <FadeImage
                fill
                priority
                src={current}
                sizes='(min-width: 1024px) 45vw, 100vw'
                className='object-cover'
                alt='product image'
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div
          className='flex shrink-0 gap-3 overflow-x-auto pb-1 md:w-20 md:flex-col md:overflow-visible md:pb-0'
          role='group'
          aria-label='Product images'>
          {images.map((image, i) => (
            <button
              type='button'
              onClick={() => handleCurrentImage(i)}
              key={i}
              aria-label={`Show image ${i + 1}`}
              aria-current={current === image}
              className={cn(
                'relative aspect-[4/5] w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-muted ring-offset-2 ring-offset-background transition-[opacity,box-shadow] md:w-full',
                current === image ? 'ring-2 ring-foreground' : 'opacity-70 hover:opacity-100',
              )}>
              <Image
                fill
                src={image}
                sizes='80px'
                className='object-cover'
                alt=''
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
