'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PencilIcon, Trash2Icon } from 'lucide-react';

import { deleteBanner, setBannerActive } from '@/actions/banner.actions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

export const BannerActiveSwitch = ({ id, title, isActive }: { id: string; title: string; isActive: boolean }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={isActive}
      disabled={isPending}
      aria-label={`Show "${title}" on the homepage`}
      onCheckedChange={checked =>
        startTransition(async () => {
          const res = await setBannerActive(id, checked);
          if (res.success) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
    />
  );
};

export const BannerRowActions = ({ id, title }: { id: string; title: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button
        asChild
        variant='ghost'
        size='icon'
        aria-label={`Edit "${title}"`}>
        <Link href={`/admin/banners/${id}`}>
          <PencilIcon className='size-4' />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            disabled={isPending}
            aria-label={`Delete "${title}"`}
            className='text-muted-foreground hover:text-destructive'>
            <Trash2Icon className='size-4' />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{title}&rdquo; will be removed from the homepage and deleted. To keep it for later, hide it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteBanner(id);
                  if (res.success) toast.success(res.message);
                  else toast.error(res.message);
                  router.refresh();
                })
              }>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
