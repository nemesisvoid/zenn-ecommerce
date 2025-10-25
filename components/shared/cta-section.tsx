import { MailIcon } from 'lucide-react';
import { Button } from '../ui/button';

const CtaSection = () => {
  return (
    <section className='container translate-y-20'>
      <div className='bg-black text-white flex flex-col md:flex-row items-center justify-between p-10 rounded-2xl'>
        <p className='text-4xl md:text-5xl font-semibold uppercase w-1/2 md:leading-[1.1]'>
          stay up to date about <br className='hidden md:block' /> our latest offers
        </p>

        <div className='flex flex-col gap-4 w-1/3'>
          <div className='flex items-center gap-2 rounded-2xl   border border-white'>
            <MailIcon className='w-6 h-6 ml-3' />
            <input
              autoComplete=''
              className='w-full bg-black border-none outline-none focus-within:border-none rounded-xl py-3 active:bg-transparent focus:bg-transparent'
              placeholder='enter your email address'
            />
          </div>

          <Button className='bg-white text-black text-lg cursor-pointer py-6 px-3 rounded-2xl hover:text-white hover:bg-transparent'>
            Subscribe to Newsletter
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
