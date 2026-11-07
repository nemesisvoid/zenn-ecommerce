import type { ReactNode } from 'react';

interface UserStatCardProp {
  title: string;
  text: string | number;
  hint?: string;
  icon: ReactNode;
}

const UserStatCard = ({ title, text, hint, icon }: UserStatCardProp) => (
  <div className='rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-dark-100'>
    <div className='flex items-center justify-between gap-3'>
      <p className='text-sm text-muted-foreground'>{title}</p>
      <span
        className='flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-ink'
        aria-hidden='true'>
        {icon}
      </span>
    </div>
    <p className='mt-3 text-2xl font-semibold tabular-nums text-foreground'>{text}</p>
    {hint && <p className='mt-1 text-xs text-muted-foreground'>{hint}</p>}
  </div>
);

export default UserStatCard;
