'use client';

import { deleteProduct } from '@/actions/product.actions';
import { useDelete } from '@/hooks/use-delete';

import { Row } from '@tanstack/react-table';
import { AllProductsColumnType } from './all-products-column';

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

export const CustomCell = ({ row }: { row: Row<AllProductsColumnType> }) => {
  const { isPending, handleDelete } = useDelete(deleteProduct);
  console.log({ row });
  const router = useRouter();

  return (
    <div className='flex items-center gap-3'>
      <Button
        asChild
        className='table-edit-button'>
        <Link href={`/admin/products/${row.original.slug}`}>
          <Edit2Icon size={10} />
        </Link>
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
