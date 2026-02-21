import { MailIcon } from 'lucide-react';
import { Button } from '../ui/button';

const CtaSection = () => {
  return (
    <div className='relative container'>
      {/* Floating CTA */}
      <div
        className='
          relative z-10
          -mb-20 md:-mb-24   /* pulls footer up under it */
          
          rounded-3xl
          px-6 py-8 md:px-10 md:py-10
          
          bg-gradient-to-br from-black via-gray-900 to-black
          text-white shadow-2xl
        '>
        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          {/* Text */}
          <div className='max-w-lg'>
            <p className='text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight'>Stay up to date about our latest offers</p>
            <p className='text-sm text-gray-300 mt-2'>Get exclusive drops and deals straight to your inbox.</p>
          </div>

          {/* Input */}
          <div className='w-full md:w-auto md:min-w-[360px] space-y-3'>
            <div className='flex items-center gap-3 rounded-xl px-4 py-3 bg-white/10 backdrop-blur border border-white/20'>
              <MailIcon className='w-5 h-5 text-white/70' />
              <input
                className='w-full bg-transparent outline-none placeholder:text-white/50'
                placeholder='Enter your email address'
              />
            </div>

            <Button className='w-full rounded-xl py-5 bg-white text-black hover:bg-gray-200'>Subscribe</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CtaSection;
