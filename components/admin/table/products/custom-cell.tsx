'use client';

import Link from 'next/link';
import { Row } from '@tanstack/react-table';
import { Edit2Icon } from 'lucide-react';

import { AllProductsColumnType } from './all-products-column';
import ArchiveProductButton from '@/components/admin/products/archive-product-button';
import { Button } from '@/components/ui/button';

export const CustomCell = ({ row }: { row: Row<AllProductsColumnType> }) => {
  return (
    <div className='flex items-center gap-3'>
      <Button
        asChild
        className='table-edit-button'>
        <Link
          href={`/admin/products/${row.original.slug}`}
          aria-label={`Edit "${row.original.name}"`}>
          <Edit2Icon size={10} />
        </Link>
      </Button>

      <ArchiveProductButton
        id={row.original.id}
        name={row.original.name}
        isArchived={row.original.isArchived}
      />
    </div>
  );
};
