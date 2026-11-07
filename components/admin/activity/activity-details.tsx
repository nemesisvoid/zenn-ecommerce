import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { FieldChange, FormattedValue, ParsedDetails } from './activity-format';

/** Changes this short are shown expanded; longer ones start collapsed. */
const AUTO_OPEN_LIMIT = 2;
const SUMMARY_FIELDS = 3;

const panel = 'mt-2 overflow-hidden rounded-md border border-black/5 bg-black/[0.02] text-xs dark:border-white/10 dark:bg-white/[0.03]';
const row = 'grid gap-1 px-3 py-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4';
const labelClass = 'font-medium text-gray-700 dark:text-white/80';

const Value = ({ value, tone }: { value: FormattedValue; tone?: 'old' | 'new' }) => {
  const className = cn(
    'inline-block max-w-full rounded px-1.5 py-0.5 break-words whitespace-pre-wrap',
    value.mono && 'font-mono text-[11px]',
    value.muted
      ? 'italic text-[#5D7186] dark:text-[#AAB8C5]'
      : tone === 'old'
        ? 'bg-rose-50 text-rose-800 line-through decoration-rose-400/70 dark:bg-rose-950/40 dark:text-rose-200'
        : tone === 'new'
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
          : 'text-gray-800 dark:text-white/90',
  );

  if (tone === 'old') {
    return (
      <del
        className={className}
        title={value.title}>
        {value.text}
      </del>
    );
  }
  if (tone === 'new') {
    return (
      <ins
        className={cn(className, 'no-underline')}
        title={value.title}>
        {value.text}
      </ins>
    );
  }
  return (
    <span
      className={className}
      title={value.title}>
      {value.text}
    </span>
  );
};

const Chips = ({ items, tone }: { items: string[]; tone: 'added' | 'removed' }) => (
  <>
    {items.map((item, i) => (
      <span
        key={`${tone}-${i}-${item}`}
        className={cn(
          'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 break-all',
          tone === 'added'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
            : 'border-rose-200 bg-rose-50 text-rose-800 line-through decoration-rose-400/70 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200',
        )}>
        <span aria-hidden='true'>{tone === 'added' ? '+' : '−'}</span>
        <span className='sr-only'>{tone === 'added' ? 'Added' : 'Removed'}:</span>
        {item}
      </span>
    ))}
  </>
);

const ChangeRow = ({ change }: { change: FieldChange }) => (
  <div className={row}>
    <dt className={labelClass}>{change.label}</dt>
    <dd className='flex min-w-0 flex-wrap items-center gap-1.5'>
      {change.kind === 'value' ? (
        <>
          <span className='sr-only'>changed from</span>
          <Value
            value={change.from}
            tone='old'
          />
          <ArrowRightIcon
            aria-hidden='true'
            className='size-3.5 shrink-0 text-[#5D7186] dark:text-[#AAB8C5]'
          />
          <span className='sr-only'>to</span>
          <Value
            value={change.to}
            tone='new'
          />
        </>
      ) : (
        <>
          <Chips
            items={change.added}
            tone='added'
          />
          <Chips
            items={change.removed}
            tone='removed'
          />
        </>
      )}
    </dd>
  </div>
);

const Disclosure = ({ summary, open, children }: { summary: React.ReactNode; open?: boolean; children: React.ReactNode }) => (
  <details
    className='group mt-2'
    open={open}>
    <summary
      className={cn(
        'inline-flex max-w-full cursor-pointer list-none items-center gap-1 rounded-sm text-xs font-medium',
        'text-[#5D7186] hover:text-gray-900 dark:text-[#AAB8C5] dark:hover:text-white',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden',
      )}>
      <ChevronRightIcon
        aria-hidden='true'
        className='size-3.5 shrink-0 transition-transform group-open:rotate-90'
      />
      <span className='truncate'>{summary}</span>
    </summary>
    {children}
  </details>
);

interface ActivityDetailsProps {
  details: ParsedDetails;
  /** DELETE logs carry a snapshot of the removed record. */
  isDeletion?: boolean;
}

const ActivityDetails = ({ details, isDeletion }: ActivityDetailsProps) => {
  switch (details.kind) {
    case 'none':
      return null;

    case 'text':
      return (
        <p className='mt-1.5 text-xs text-[#5D7186] dark:text-[#AAB8C5]'>
          <Value value={details.value} />
        </p>
      );

    case 'changes': {
      const { changes } = details;
      const names = changes.slice(0, SUMMARY_FIELDS).map(c => c.label);
      const rest = changes.length - names.length;
      const summary = `${changes.length} ${changes.length === 1 ? 'change' : 'changes'}: ${names.join(', ')}${rest > 0 ? ` +${rest} more` : ''}`;

      return (
        <Disclosure
          summary={summary}
          open={changes.length <= AUTO_OPEN_LIMIT}>
          <dl className={cn(panel, 'divide-y divide-black/5 dark:divide-white/10')}>
            {changes.map(change => (
              <ChangeRow
                key={change.field}
                change={change}
              />
            ))}
          </dl>
        </Disclosure>
      );
    }

    case 'snapshot':
      return (
        <Disclosure summary={isDeletion ? 'Record at time of deletion' : 'Details'}>
          <dl className={cn(panel, 'divide-y divide-black/5 dark:divide-white/10')}>
            {details.entries.map(entry => (
              <div
                key={entry.field}
                className={row}>
                <dt className={labelClass}>{entry.label}</dt>
                <dd className='min-w-0'>
                  <Value value={entry.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      );
  }
};

export default ActivityDetails;
