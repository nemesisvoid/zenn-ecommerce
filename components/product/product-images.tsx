'use client';

import Image from 'next/image';
import { useState } from 'react';

const ProductImages = ({ images }: { images: string[] }) => {
  console.log(images);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handleCurrentImage = (image: number) => {
    setCurrentImageIndex(image);
  };

  return (
    <div className='flex gap-6'>
      <div className='flex flex-col gap-6'>
        {images.map((image, i) => (
          <div
            onClick={() => handleCurrentImage(i)}
            key={i}
            className='relative aspect-square cursor-pointer w-40 h-40'>
            <Image
              fill
              src={image}
              className='object-cover rounded-xl'
              alt='product image'
            />
          </div>
        ))}
      </div>

      <div className='relative aspect-square w-full self-start'>
        <Image
          fill
          src={images[currentImageIndex]}
          className='object-cover rounded-xl self-cente'
          alt='product image'
        />
      </div>
    </div>
  );
};

export default ProductImages;
