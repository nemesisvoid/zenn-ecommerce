import Link from 'next/link';
import { AlertTriangleIcon, ScrollTextIcon, SearchXIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const VARIANTS = {
  empty: {
    icon: ScrollTextIcon,
    title: 'No activity yet',
    text: 'When an admin creates, edits or deletes products, categories, banners or users, it will be recorded here.',
  },
  'no-results': {
    icon: SearchXIcon,
    title: 'No matching activity',
    text: 'Nothing matches these filters. Try a different search term or clear the filters.',
  },
  error: {
    icon: AlertTriangleIcon,
    title: "Couldn't load the activity log",
    text: 'Something went wrong while fetching the log. Please try again in a moment.',
  },
} as const;

interface ActivityEmptyStateProps {
  variant: keyof typeof VARIANTS;
  /** Link for the call to action (clear filters / retry). */
  href?: string;
}

const ActivityEmptyState = ({ variant, href }: ActivityEmptyStateProps) => {
  const { icon: Icon, title, text } = VARIANTS[variant];
  const cta = variant === 'no-results' ? 'Clear filters' : variant === 'error' ? 'Try again' : null;

  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className='flex flex-col items-center px-6 py-16 text-center'>
      <span
        aria-hidden='true'
        className={
          variant === 'error'
            ? 'mb-4 flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
            : 'mb-4 flex size-12 items-center justify-center rounded-full bg-black/[0.04] text-[#5D7186] dark:bg-white/[0.06] dark:text-[#AAB8C5]'
        }>
        <Icon className='size-5' />
      </span>
      <h2 className='text-base font-semibold text-gray-900 dark:text-white'>{title}</h2>
      <p className='mt-1 max-w-sm text-sm text-[#5D7186] dark:text-[#AAB8C5]'>{text}</p>
      {cta && href && (
        <Button
          asChild
          variant='outline'
          size='sm'
          className='mt-5'>
          <Link
            href={href}
            scroll={false}>
            {cta}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default ActivityEmptyState;
