'use client';

import { formatCurrency } from '@/helper/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

export type DashboardProductColumnType = {
  id: string;
  name: string;
  image: string;
  price: number;
};
export const dashboardProductColumn: ColumnDef<DashboardProductColumnType>[] = [
  { header: 'Product', accessorKey: 'name' },
  { header: 'Price', accessorKey: 'price', cell: row => <p>{formatCurrency(row.row.original.price)}</p> },
  { header: 'Orders', accessorKey: 'totalOrders' },
  {
    header: 'Image',
    accessorKey: 'image',
    cell: row => (
      <div className='relative aspect-square'>
        <Image
          src={row.row.original.image}
          fill
          alt='product image'
          className='rounded-lg object-cover'
        />
      </div>
    ),
  },
];
