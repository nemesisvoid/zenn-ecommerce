'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const slides = [
  {
    id: 1,
    title: 'Flash Sale Collections',
    desc: 'Get the best deals on our exclusive collections',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bg: 'bg-gradient-to-r from-yellow-50 to-pink-100',
    url: '/',
  },
  {
    id: 2,
    title: 'Gadget Collections',
    desc: 'Get the best deals on our exclusive collections',
    img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bg: 'bg-gradient-to-r from-yellow-50 to-green-200',
    url: '/',
  },
  {
    id: 3,
    title: 'Gadget Collections',
    desc: 'Get the best deals on our exclusive collections',
    img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bg: 'bg-gradient-to-r from-yellow-50 to-orange-200',
    url: '/',
  },
];
const HeroSlider = () => {
  const [sliderIndex, setSliderIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSliderIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  //     return () => clearInterval(interval);
  //   }, 6000);
  // }, []);

  return (
    <div className='h-[calc(100vh-80px)] overflow-hidden'>
      <div
        className='w-max h-full flex translate-all ease-in-out duration-700'
        style={{ transform: `translateX(-${sliderIndex * 100}vw)` }}>
        {slides.map(slide => (
          <div
            key={slide.id}
            className={`w-screen h-full flex flex-col items-center xl:flex-row gap-16 ${slide.bg}`}>
            <div className='w-full h-1/2 lg:h-full flex flex-col items-center justify-center gap-8 text-center md:text-left md:w-1/2 my-auto'>
              <h1 className='text-5xl font-bold'>{slide.title}</h1>
              <h2>{slide.desc}</h2>

              <Link
                href={slide.url}
                className='bg-black text-white text-xl py-3 px-8 rounded-xl hover:bg-black/90 transition-all duration-300'>
                Shop Now
              </Link>
            </div>

            <div
              className='relative aspect-square w-full h-1/2 lg:h-full lg:w-1/2 
            '>
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                priority={true}
                quality={90}
                className='object-cover rounded-xs'
              />
            </div>
          </div>
        ))}
      </div>

      <div className='absolute flex gap-8 m-auto left-1/2 bottom-8'>
        {slides.map((slide, i) => (
          <div
            className={`size-4 rounded-full border border-black flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white ${
              sliderIndex === i ? 'scale-150' : ''
            }`}
            key={slide.id}
            onClick={() => setSliderIndex(i)}>
            {sliderIndex === i && <div className='size-2 rounded-full bg-stone-600' />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
