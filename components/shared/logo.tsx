import Link from 'next/link';
import { cn } from '@/lib/utils';
import BrandMark from './brand-mark';

/** Mark + serif wordmark. Size it with a text size class: the mark scales with the font. */
const Logo = ({ className, href = '/' }: { className?: string; href?: string }) => {
  return (
    <Link
      aria-label='Zenn home'
      className={cn(
        'group inline-flex items-center gap-[0.3em] rounded-sm font-display text-[2rem] leading-none tracking-tight text-foreground transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
      href={href}>
      <BrandMark className='size-[0.85em] transition-transform duration-300 group-hover:-rotate-6' />
      <span className='-mb-[0.06em]'>Zenn</span>
    </Link>
  );
};

export default Logo;
