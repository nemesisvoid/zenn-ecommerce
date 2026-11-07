'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArchiveIcon, ArchiveRestoreIcon, Loader2Icon } from 'lucide-react';

import { archiveProduct, restoreProduct } from '@/actions/product.actions';
import { Button } from '@/components/ui/button';
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

type Props = {
  id: string;
  name: string;
  isArchived: boolean;
  /** `icon` for table rows, `full` for the product page. */
  variant?: 'icon' | 'full';
};

/** Products are never deleted: archiving hides them from the store and keeps them for records. */
const ArchiveProductButton = ({ id, name, isArchived, variant = 'icon' }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fn: (id: string) => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const res = await fn(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
      router.refresh();
    });

  const spinner = (
    <Loader2Icon
      className='size-4 animate-spin'
      aria-hidden='true'
    />
  );

  if (isArchived) {
    return (
      <Button
        type='button'
        variant='outline'
        size={variant === 'icon' ? 'icon' : 'default'}
        disabled={isPending}
        onClick={() => run(restoreProduct)}
        aria-label={`Restore "${name}" to the store`}
        title='Restore to store'>
        {isPending ? spinner : <ArchiveRestoreIcon className='size-4' />}
        {variant === 'full' && 'Restore to store'}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size={variant === 'icon' ? 'icon' : 'default'}
          disabled={isPending}
          aria-label={`Archive "${name}"`}
          title='Archive'
          className='text-muted-foreground hover:text-foreground'>
          {isPending ? spinner : <ArchiveIcon className='size-4' />}
          {variant === 'full' && 'Archive product'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive &ldquo;{name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be hidden from the store and can no longer be bought. Past orders and records keep it, and you can restore it at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => run(archiveProduct)}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveProductButton;
