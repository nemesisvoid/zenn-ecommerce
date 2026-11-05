import { cn } from '@/lib/utils';

type SpinnerProps = React.SVGProps<SVGSVGElement>;

/**
 * A faint track with a sweeping arc. Uses currentColor, so it matches whatever
 * button or text it sits in. Decorative by default; pass aria-label to announce it.
 */
const Spinner = ({ className, ...props }: SpinnerProps) => {
  const labelled = Boolean(props['aria-label']);
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      role={labelled ? 'status' : undefined}
      aria-hidden={labelled ? undefined : true}
      {...props}
      className={cn('size-4 shrink-0 animate-[spin_0.7s_linear_infinite] motion-reduce:animate-[spin_1.6s_linear_infinite]', className)}>
      <circle
        cx='12'
        cy='12'
        r='9'
        stroke='currentColor'
        strokeWidth='2.5'
        opacity='0.2'
      />
      <path
        d='M21 12a9 9 0 0 0-9-9'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
      />
    </svg>
  );
};

export default Spinner;
