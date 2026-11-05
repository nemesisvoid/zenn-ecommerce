import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

const EmptyState = ({ icon: Icon, title, description, children, className }: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-20 text-center md:py-28', className)}>
      <span className='flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground'>
        <Icon
          className='size-6'
          aria-hidden='true'
        />
      </span>
      <h2 className='mt-6 font-display text-3xl tracking-tight text-foreground md:text-4xl'>{title}</h2>
      {description && <p className='lede mt-3 max-w-sm'>{description}</p>}
      {children && <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>{children}</div>}
    </div>
  );
};

export default EmptyState;
