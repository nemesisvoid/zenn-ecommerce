'use client';

import { formatCurrency } from '@/helper/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CustomCell } from './custom-cell';

export type AllProductsColumnType = {
  id: string;
  name: string;
  images: string[];
  price: number;
  category?: { name: string } | null;
  variants?: { size?: string | null; color?: string | null }[];
  stock?: number;
  ratings?: number;
};

export const allProductsColumn: ColumnDef<AllProductsColumnType>[] = [
  {
    header: 'Product Name',
    accessorKey: 'name',
    cell: ({ row }) => {
      const sizes = Array.from(new Set((row.original.variants ?? []).map(v => v.size).filter((v): v is string => Boolean(v))));

      const colors = Array.from(new Set((row.original.variants ?? []).map(v => v.color).filter((v): v is string => Boolean(v))));
      return (
        <div className='flex gap-5 '>
          <div className='relative aspect-square size-15'>
            <Image
              src={row.original?.images?.[0] || ''}
              fill
              alt={`${row.original.name} image`}
              className='object-cover rounded-sm absolute w-full'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='text-black'>{row.original.name}</p>
            <p className='text-xs text-muted-foreground'>{sizes.length ? 'Sizes: ' + sizes.join(', ') : ''}</p>

            <p className='text-xs text-muted-foreground'>{colors.length ? 'Colors: ' + colors.join(', ') : ''}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Price',
    accessorKey: 'price',
    cell: ({ row }) => <p>{formatCurrency(row.original.price)}</p>,
  },
  {
    header: 'Category',
    accessorKey: 'category',
    cell: ({ row }) => <p>{row.original.category?.name ?? '-'}</p>,
  },
  {
    header: 'Colors',
    accessorKey: 'colors',
    cell: ({ row }) => {
      const colors = Array.from(new Set((row.original.variants ?? []).map(v => v.color).filter((v): v is string => Boolean(v))));
      return (
        <div className='flex items-center gap-2'>
          {colors.length ? (
            colors.map(c => (
              <span
                key={c}
                title={c}
                className='inline-block size-3 rounded-full border border-border'
                style={{ backgroundColor: c }}
              />
            ))
          ) : (
            <span className='text-sm'>-</span>
          )}
        </div>
      );
    },
  },
  { header: 'Stock', accessorKey: 'stock', cell: ({ row }) => <p>{row.original.stock}</p> },
  { header: 'Ratings', accessorKey: 'ratings' },
  {
    header: 'Action',
    accessorKey: 'action',

    cell: ({ row }) => <CustomCell row={row} />,
  },
];
