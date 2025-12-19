'use client';

import { formatCurrency } from '@/helper/utils';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export type UserTransactionColumn = {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  isPaid?: boolean;
  orderDate: Date;
};

export const userTransactionColumn: ColumnDef<UserTransactionColumn>[] = [
  {
    header: 'Order ID',
    accessorKey: 'id',
    cell: ({ row }) => <Link href={`/admin/orders/${row.original.id}`}>{row.original.id}</Link>,
  },

  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <p>{row.original.status}</p>,
  },

  {
    header: 'Total Amount',
    accessorKey: 'totalAmount',
    cell: ({ row }) => <p>{formatCurrency(row.original.totalAmount)}</p>,
  },
  // {
  //   header: 'Is Paid',
  //   accessorKey: 'isPaid',
  //   cell: ({ row }) => <p>{row.original.isPaid}</p>,
  // },
  {
    header: 'Payment Method',
    accessorKey: 'paymentMethod',
  },
  {
    header: 'Order Date',
    accessorKey: 'orderDate',
    cell: ({ row }) => <p>{row.original.orderDate.toDateString()}</p>,
  },
];
