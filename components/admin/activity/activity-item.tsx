import type { ActivityLogEntry } from '@/actions/activity.action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import ActivityDetails from './activity-details';
import { getActionMeta, getActorName, getEntityMeta, getInitials, parseDetails } from './activity-format';
import ActivityTime from './activity-time';

interface ActivityItemProps {
  log: ActivityLogEntry;
  renderedAt: number;
}

const muted = 'text-[#5D7186] dark:text-[#AAB8C5]';

const ActivityItem = ({ log, renderedAt }: ActivityItemProps) => {
  const action = getActionMeta(log.action);
  const entity = getEntityMeta(log.entity);
  const actorName = getActorName(log.user);
  const avatarSrc = log.user.image || log.user.avatar || undefined;
  const isLogPurge = log.entity === 'ACTIVITY_LOG';
  const details = parseDetails(log.details);

  // The purge record's only detail is the number of entries removed: say it inline.
  const purgedCount =
    isLogPurge && details.kind === 'snapshot' ? details.entries.find(entry => entry.field === 'deletedEntries')?.value.text : undefined;

  const ActionIcon = action.icon;
  const EntityIcon = entity.icon;

  return (
    <li className='flex gap-3 px-4 py-4 transition-colors hover:bg-black/[0.015] sm:gap-4 sm:px-6 dark:hover:bg-white/[0.02]'>
      <div className='relative h-fit shrink-0'>
        <Avatar size='lg'>
          {avatarSrc && (
            <AvatarImage
              src={avatarSrc}
              alt=''
            />
          )}
          <AvatarFallback className='bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-white/80'>
            {getInitials(actorName)}
          </AvatarFallback>
        </Avatar>
        <span
          aria-hidden='true'
          className={cn(
            'absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#282F36]',
            action.markerClass,
          )}>
          <ActionIcon className='size-3' />
        </span>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
          <p className='min-w-0 text-sm leading-6 text-gray-700 dark:text-white/90'>
            <span className='font-semibold text-gray-900 dark:text-white'>{actorName}</span>{' '}
            {isLogPurge ? (
              <>
                cleared the activity log
                {purgedCount && <span className={muted}> ({purgedCount} {purgedCount === '1' ? 'entry' : 'entries'} removed)</span>}
              </>
            ) : (
              <>
                {action.verb} {entity.noun}{' '}
                <span
                  className='font-semibold break-words text-gray-900 dark:text-white'
                  title={log.entityName}>
                  {log.entityName || <span className={cn('font-normal italic', muted)}>unnamed</span>}
                </span>
              </>
            )}
          </p>

          <div className='shrink-0'>
            <ActivityTime
              dateTime={log.createdAt.toISOString()}
              renderedAt={renderedAt}
            />
          </div>
        </div>

        <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', action.badgeClass)}>
            <ActionIcon
              aria-hidden='true'
              className='size-3'
            />
            {action.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-black/10 px-2 py-0.5 text-[11px] font-medium capitalize dark:border-white/10',
              muted,
            )}>
            <EntityIcon
              aria-hidden='true'
              className='size-3'
            />
            {entity.noun}
          </span>
          {log.user.email !== actorName && <span className={cn('min-w-0 truncate text-[11px]', muted)}>{log.user.email}</span>}
        </div>

        {!isLogPurge && (
          <ActivityDetails
            details={details}
            isDeletion={log.action === 'DELETE'}
          />
        )}
      </div>
    </li>
  );
};

export default ActivityItem;
