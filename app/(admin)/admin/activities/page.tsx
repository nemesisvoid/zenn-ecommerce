import type { Metadata } from 'next';

import { getActivityLogs, type ActivityLogFilters } from '@/actions/activity.action';
import ActivityEmptyState from '@/components/admin/activity/activity-empty-state';
import ActivityFilters from '@/components/admin/activity/activity-filters';
import { ACTION_OPTIONS, getEntityOptions } from '@/components/admin/activity/activity-format';
import ActivityItem from '@/components/admin/activity/activity-item';
import ActivityPagination from '@/components/admin/activity/activity-pagination';
import ClearActivityLogButton from '@/components/admin/activity/clear-activity-log-button';
import AdminHeader from '@/components/admin/admin-header';

export const metadata: Metadata = { title: 'Activity log' };

const PAGE_PATH = '/admin/activities';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const buildHref = (filters: ActivityLogFilters, page = 1) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.action) params.set('action', filters.action);
  if (filters.entity) params.set('entity', filters.entity);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${PAGE_PATH}?${qs}` : PAGE_PATH;
};

const ActivitiesPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const result = await getActivityLogs({
    page: Number(first(params.page)) || 1,
    q: first(params.q),
    action: first(params.action),
    entity: first(params.entity),
  });

  const { filters } = result;
  const isFiltered = Boolean(filters.q || filters.action || filters.entity);
  const renderedAt = Date.now();

  return (
    <div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <AdminHeader
          title='Activity log'
          text='Who changed what across products, categories, banners and users.'
        />
        <div className='sm:mb-3'>
          <ClearActivityLogButton disabled={!result.success || !result.hasAnyLogs} />
        </div>
      </div>

      <section
        aria-labelledby='activity-log-heading'
        className='admin-card mt-2 overflow-hidden p-0!'>
        <h2
          id='activity-log-heading'
          className='sr-only'>
          Activity entries
        </h2>

        <div className='border-b border-black/5 bg-[#FCFCFD] px-4 py-4 sm:px-6 dark:border-white/10 dark:bg-[#293038]'>
          <ActivityFilters
            actions={ACTION_OPTIONS}
            entities={getEntityOptions(result.success ? result.entities : [])}
            action={filters.action}
            entity={filters.entity}
            q={filters.q}
          />
        </div>

        {!result.success ? (
          <ActivityEmptyState
            variant='error'
            href={buildHref(filters)}
          />
        ) : result.total === 0 ? (
          <ActivityEmptyState
            variant={isFiltered && result.hasAnyLogs ? 'no-results' : 'empty'}
            href={PAGE_PATH}
          />
        ) : (
          <>
            <p
              aria-live='polite'
              className='border-b border-black/5 px-4 py-2.5 text-xs text-[#5D7186] sm:px-6 dark:border-white/10 dark:text-[#AAB8C5]'>
              Showing{' '}
              <span className='font-medium text-gray-700 tabular-nums dark:text-white/80'>
                {((result.page - 1) * result.pageSize + 1).toLocaleString('en-US')}–
                {Math.min(result.page * result.pageSize, result.total).toLocaleString('en-US')}
              </span>{' '}
              of <span className='font-medium text-gray-700 tabular-nums dark:text-white/80'>{result.total.toLocaleString('en-US')}</span>{' '}
              {result.total === 1 ? 'entry' : 'entries'}
              {isFiltered && ' matching your filters'}
            </p>

            <ol className='divide-y divide-black/5 dark:divide-white/10'>
              {result.logs.map(log => (
                <ActivityItem
                  key={log.id}
                  log={log}
                  renderedAt={renderedAt}
                />
              ))}
            </ol>

            <ActivityPagination
              page={result.page}
              totalPages={result.totalPages}
              hrefFor={page => buildHref(filters, page)}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default ActivitiesPage;
