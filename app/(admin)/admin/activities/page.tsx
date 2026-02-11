import { deleteAllActivityLogs, getAllActivityLogs } from '@/actions/activity.action';
import AdminHeader from '@/components/admin/admin-header';
import ActivityDetails from '@/components/misc/activity-details';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRightCircleIcon } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

const ActivitiesPage = async () => {
  const logs = await getAllActivityLogs();
  if (!logs) return <div>no logs</div>;
  console.log(logs);

  // const handleDeleteActivityLogs = async () => {
  //   startTransition(async () => {
  //     const res = await deleteAllActivityLogs();
  //     if (res?.success) {
  //       toast.success(res?.message);
  //     } else {
  //       toast.error(res?.message);
  //     }
  //   });
  // };

  return (
    <div>
      <AdminHeader
        title='Activities'
        text='Manage your store activities'
      />

      <div className='space-y-4'>
        {logs.map(log => (
          <div
            key={log.id}
            className='flex gap-4 rounded border p-4'>
            <Avatar>
              <AvatarImage
                src={log.user.image || '/avatar-fallback.png'}
                alt={log.user.name || 'User avatar'}
              />
            </Avatar>

            <div className='flex-1'>
              <p className='text-sm'>
                <span className='font-medium'>{log.user.name}</span> <span className={getActionColor(log.action)}>{log.action}</span> {log.entity}{' '}
                {log.entityName && <span className='font-medium'>{log.entityName}</span>}
              </p>

              {log.details && (
                <details className='mt-1'>
                  <summary className='cursor-pointer text-xs text-blue-600'>View changes</summary>
                  <ActivityDetails details={log.details} />
                </details>
              )}

              <p className='mt-1 text-xs text-gray-400'>{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}

        <form
          action={async () => {
            'use server';
            await deleteAllActivityLogs();
          }}>
          <Button type='submit'>Delete All Logs</Button>
        </form>
      </div>
    </div>
  );
};

export default ActivitiesPage;

function getActionColor(action: string) {
  switch (action) {
    case 'CREATE':
      return 'text-green-600 font-bold';
    case 'DELETE':
      return 'text-red-600 font-bold';
    case 'UPDATE':
      return 'text-blue-600 font-bold';
    default:
      return 'text-gray-600';
  }
}
