'use client';

import { flushSync } from 'react-dom';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    // Apply the class immediately so the view transition captures the new state;
    // next-themes then persists the choice.
    const apply = () => {
      root.classList.toggle('dark', next === 'dark');
      root.style.colorScheme = next;
      setTheme(next);
    };

    const doc = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduceMotion) {
      apply();
      return;
    }

    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => flushSync(apply));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label='Toggle dark mode'
      className={cn('icon-button', className)}>
      <SunIcon
        className='size-[19px] rotate-0 scale-100 transition-transform duration-500 dark:-rotate-90 dark:scale-0'
        aria-hidden='true'
      />
      <MoonIcon
        className='absolute size-[18px] rotate-90 scale-0 transition-transform duration-500 dark:rotate-0 dark:scale-100'
        aria-hidden='true'
      />
    </button>
  );
};

export default ThemeToggle;
