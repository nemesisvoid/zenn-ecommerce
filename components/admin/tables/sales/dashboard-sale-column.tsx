'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export type DashboardSaleColumn = {
  orderId: string;
  orderDate: Date;
  product: string;
  customerName: string;
  email: string;
  address: string;
  paymentMethod: string;
  status: string;
};

export const dashboardSaleColumn: ColumnDef<DashboardSaleColumn>[] = [
  {
    header: 'Order Id',
    accessorKey: 'orderId',
    cell: ({ row }) => (
      <Link
        href={`/admin/order/${row.original.orderId}`}
        className='hover:text-purple-400 duration-300'>
        {row.original.orderId}
      </Link>
    ),
  },
  { header: 'Order Date', accessorKey: 'orderDate' },
  { header: 'Product', accessorKey: 'product' },
  { header: 'Customer Name', accessorKey: 'customerName' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Address', accessorKey: 'address' },
  { header: 'Payment Method', accessorKey: 'paymentMethod' },
  { header: 'Status', accessorKey: 'status' },
];
