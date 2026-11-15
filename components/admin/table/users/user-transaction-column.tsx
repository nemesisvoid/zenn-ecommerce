'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import type { DeliveryStatus, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

import OrderStatusPill from '@/components/shared/order-status-pill';
import { formatCurrency } from '@/helper/utils';

export type UserTransactionColumn = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  orderDate: Date;
};

export const userTransactionColumn: ColumnDef<UserTransactionColumn>[] = [
  {
    header: 'Order',
    accessorKey: 'id',
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className='font-mono text-xs font-medium text-foreground hover:underline'
        title={row.original.id}>
        #{row.original.id.slice(0, 8).toUpperCase()}
      </Link>
    ),
  },
  {
    header: 'Date',
    accessorKey: 'orderDate',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>
        {row.original.orderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    header: 'Payment',
    accessorKey: 'paymentStatus',
    cell: ({ row }) => <OrderStatusPill status={row.original.status === 'CANCELLED' ? 'CANCELLED' : row.original.paymentStatus} />,
  },
  {
    header: 'Delivery',
    accessorKey: 'deliveryStatus',
    cell: ({ row }) => <OrderStatusPill status={row.original.deliveryStatus} />,
  },
  {
    header: 'Method',
    accessorKey: 'paymentMethod',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-muted-foreground'>{row.original.paymentMethod === 'PAYSTACK' ? 'Paystack' : 'Pay on delivery'}</span>
    ),
  },
  {
    header: 'Total',
    accessorKey: 'totalAmount',
    cell: ({ row }) => <span className='font-medium tabular-nums text-foreground'>{formatCurrency(row.original.totalAmount)}</span>,
  },
];
