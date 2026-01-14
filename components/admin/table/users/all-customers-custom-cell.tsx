import { deleteUser } from '@/actions/user.action';
import { useDelete } from '@/hooks/use-delete';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogContent,
} from '@/components/ui/alert-dialog';
import { Edit2Icon, Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
const AllCustomersCustomCell = ({ row }) => {
  const { isPending, handleDelete } = useDelete(deleteUser);
  return (
    <div className='flex items-center gap-5'>
      <Button className='table-edit-button'>
        <Edit2Icon size={10} />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className='table-delete-button'>
            <Trash2Icon size={10} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='cursor-pointer'
              disabled={isPending}
              onClick={() => handleDelete(row.original.id)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AllCustomersCustomCell;
