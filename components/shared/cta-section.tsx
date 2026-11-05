import { MailIcon } from 'lucide-react';
import { Button } from '../ui/button';

const CtaSection = () => {
  return (
    <section
      aria-labelledby='newsletter-title'
      className='container pb-16 md:pb-24'>
      <div className='panel relative overflow-hidden bg-brand-soft px-6 py-10 md:px-12 md:py-14'>
        <div className='relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-xl'>
            <h2
              id='newsletter-title'
              className='section-title'>
              New drops, first.
            </h2>
            <p className='lede mt-3 max-w-md'>Get new arrivals and member-only offers in your inbox. One email a week, unsubscribe anytime.</p>
          </div>

          <div className='flex w-full flex-col gap-3 sm:flex-row md:w-auto md:min-w-[420px]'>
            <label className='relative flex-1'>
              <span className='sr-only'>Email address</span>
              <MailIcon
                className='pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                aria-hidden='true'
              />
              <input
                type='email'
                autoComplete='email'
                className='h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-[0.9375rem] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15'
                placeholder='you@example.com'
              />
            </label>

            <Button className='h-12 cursor-pointer rounded-full px-7 text-[0.9375rem] font-semibold'>Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
