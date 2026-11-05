import Link from 'next/link';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      aria-label='Zenn home'
      className={cn(
        'rounded-sm font-display text-[2rem] leading-none tracking-tight text-foreground transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
      href='/'>
      Zenn
    </Link>
  );
};

export default Logo;
