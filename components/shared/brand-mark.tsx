import { cn } from '@/lib/utils';

/**
 * The Zenn mark: a soft square holding a geometric "Z" whose diagonal is the brand gold.
 * Colours come from theme tokens, so it inverts cleanly in dark mode.
 * Static copies (favicon) live in app/icon.svg.
 */
const BrandMark = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 32 32'
    aria-hidden='true'
    focusable='false'
    className={cn('size-8 shrink-0', className)}>
    <rect
      width='32'
      height='32'
      rx='9'
      className='fill-foreground'
    />
    <path
      d='M10 10.5h12M10 21.5h12'
      strokeWidth='2.75'
      strokeLinecap='round'
      className='stroke-background'
      fill='none'
    />
    <path
      d='M21.5 11 10.5 21'
      strokeWidth='2.75'
      strokeLinecap='round'
      className='stroke-brand'
      fill='none'
    />
  </svg>
);

export default BrandMark;
