'use client';

import Image, { type ImageProps } from 'next/image';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

/** next/image that fades (and gently un-blurs) in once the file has loaded. */
const FadeImage = ({ className, onLoad, ...props }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  // Images served from cache can finish before hydration, so onLoad never fires.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <Image
      {...props}
      ref={ref}
      data-loaded={loaded}
      onLoad={event => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={cn(
        'transition-[opacity,filter,transform] duration-700 ease-out motion-reduce:transition-none',
        loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
        className,
      )}
    />
  );
};

export default FadeImage;
