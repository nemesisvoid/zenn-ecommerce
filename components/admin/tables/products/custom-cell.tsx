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
        className='text-[#FF6C2F] bg-[#FF6C2F]/30 hover:text-white hover:bg-[#FF6C2F] px-3 rounded-sm cursor-pointer'>
        <Link href={`/admin/products/${row.original.slug}`}>
          <Edit2Icon size={10} />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className='text-[#EF5F5F] bg-[#EF5F5F]/30 hover:text-white hover:bg-[#EF5F5F] px-3 rounded-sm cursor-pointer'>
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
