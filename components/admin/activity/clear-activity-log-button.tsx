'use client';

import { useState, useTransition } from 'react';
import { Loader2Icon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { deleteAllActivityLogs } from '@/actions/activity.action';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClearActivityLogButtonProps {
  disabled?: boolean;
}

const ClearActivityLogButton = ({ disabled }: ClearActivityLogButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Keep the dialog open until the request settles.
    event.preventDefault();
    startTransition(async () => {
      try {
        const res = await deleteAllActivityLogs();
        if (res.success) {
          toast.success(res.message);
          setOpen(false);
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error('Could not clear the activity log. Please try again.');
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={next => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          disabled={disabled}
          className='border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/40'>
          <Trash2Icon aria-hidden='true' />
          Clear log
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='dark:bg-[#282F36]'>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear the entire activity log?</AlertDialogTitle>
          <AlertDialogDescription>
            Every entry will be permanently deleted and can&apos;t be recovered. A single entry recording that you cleared the log will be kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(buttonVariants({ variant: 'destructive' }))}>
            {isPending && (
              <Loader2Icon
                aria-hidden='true'
                className='animate-spin'
              />
            )}
            {isPending ? 'Deleting…' : 'Delete all entries'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearActivityLogButton;
