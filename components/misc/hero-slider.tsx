'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Button } from '../ui/button';

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  href: string;
  ctaLabel: string;
};

// Shown only when no banners are live (manage banners at /admin/banners).
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'default-1',
    title: 'Flash Sale Collections',
    subtitle: 'Get the best deals on our exclusive collections',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/list',
    ctaLabel: 'Shop now',
  },
  {
    id: 'default-2',
    title: 'Gadget Collections',
    subtitle: 'Get the best deals on our exclusive collections',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/list',
    ctaLabel: 'Shop now',
  },
  {
    id: 'default-3',
    title: 'Gadget Collections',
    subtitle: 'Get the best deals on our exclusive collections',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/list',
    ctaLabel: 'Shop now',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const HeroSlider = ({ banners }: { banners: HeroSlide[] }) => {
  const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [sliderIndex, setSliderIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSliderIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  //     return () => clearInterval(interval);
  //   }, 6000);
  // }, []);

  // Clamp in case the banner list shrank while the page was open.
  const activeIndex = sliderIndex < slides.length ? sliderIndex : 0;
  const slide = slides[activeIndex];

  return (
    <MotionConfig reducedMotion='user'>
      <div className='container grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16'>
        <div className='order-2 flex flex-col lg:order-1'>
          <AnimatePresence
            mode='wait'
            initial={true}>
            <motion.div
              key={slide.id}
              initial='hidden'
              animate='show'
              exit='exit'
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
                exit: { opacity: 0, transition: { duration: 0.2 } },
              }}>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
                className='font-display text-[3.25rem] leading-[0.95] tracking-tight text-foreground sm:text-7xl xl:text-[6.5rem]'>
                {slide.title}
              </motion.h1>
              {slide.subtitle && (
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                  className='mt-6 max-w-md text-lg leading-relaxed text-muted-foreground'>
                  {slide.subtitle}
                </motion.p>
              )}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
                className='mt-9'>
                <Button
                  asChild
                  className='h-12 rounded-full px-8 text-[0.9375rem] font-semibold'>
                  <Link href={slide.href}>{slide.ctaLabel}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div
            className='mt-12 flex items-center gap-2'
            role='tablist'
            aria-label='Featured collections'>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type='button'
                role='tab'
                aria-selected={activeIndex === i}
                aria-label={`Show slide ${i + 1} of ${slides.length}`}
                onClick={() => setSliderIndex(i)}
                className='group flex h-8 cursor-pointer items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'>
                <span
                  className={`block h-[3px] rounded-full transition-all duration-500 ${
                    activeIndex === i ? 'w-12 bg-foreground' : 'w-6 bg-border group-hover:bg-muted-foreground'
                  }`}
                />
              </button>
            ))}
            <span className='ml-3 text-sm tabular-nums text-muted-foreground'>
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className='relative order-1 aspect-[4/3] overflow-hidden rounded-3xl bg-muted sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:h-[min(72vh,680px)]'>
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              className='absolute inset-0'
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.9, ease } }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}>
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={true}
                quality={90}
                sizes='(min-width: 1024px) 55vw, 100vw'
                className='object-cover'
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};

export default HeroSlider;
