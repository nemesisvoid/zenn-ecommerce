'use client';

import { useSyncExternalStore } from 'react';

// One shared clock for every timestamp on the page, ticking while any is mounted.
let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach(notify => notify());
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};

const getSnapshot = () => now;
// On the server and during hydration there is no client clock yet: fall back to the render time.
const getServerSnapshot = () => null;

const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

function formatRelative(date: Date, from: number, timeZone?: string) {
  const diff = date.getTime() - from;
  const abs = Math.abs(diff);
  if (abs < 45_000) return 'Just now';
  if (abs >= 7 * 86_400_000) {
    const year = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', timeZone });
    const sameYear = year(date) === year(new Date(from));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone, ...(sameYear ? {} : { year: 'numeric' }) });
  }
  for (const [unit, ms] of UNITS) {
    if (abs >= ms || unit === 'minute') {
      const text = rtf.format(Math.round(diff / ms), unit);
      return text[0].toUpperCase() + text.slice(1);
    }
  }
  return '';
}

interface ActivityTimeProps {
  /** ISO timestamp of the event. */
  dateTime: string;
  /** Server render time (ms), so the server and hydration renders agree. */
  renderedAt: number;
}

/**
 * Relative time ("5 minutes ago") with the exact timestamp beneath it and in the tooltip.
 * Server output uses UTC; once hydrated it switches to the viewer's own time zone.
 */
const ActivityTime = ({ dateTime, renderedAt }: ActivityTimeProps) => {
  const clientNow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const date = new Date(dateTime);
  const isClient = clientNow !== null;

  // undefined = the viewer's own zone.
  const timeZone = isClient ? undefined : 'UTC';
  const exact = date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone });
  const exactWithZone = isClient ? exact : `${exact} UTC`;

  return (
    <time
      dateTime={dateTime}
      title={exactWithZone}
      className='flex flex-col items-start text-xs sm:items-end'>
      <span className='font-medium text-gray-700 dark:text-white/80'>{formatRelative(date, clientNow ?? renderedAt, timeZone)}</span>
      <span className='hidden text-[#5D7186] sm:block dark:text-[#AAB8C5]'>{exactWithZone}</span>
    </time>
  );
};

export default ActivityTime;
