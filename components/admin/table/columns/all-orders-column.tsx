'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';

import { PaymentMethod, PaymentStatus, OrderStatus, DeliveryStatus } from '@prisma/client';
import { StatusBadge } from '@/components/misc/status-badge';

import { formatCurrency } from '@/helper/utils';

export type AllOrdersColumnType = {
  id: string;
  userId: string;
  customerName: string | null;
  avatar?: string | null;
  totalItems: number;
  orderNumber: string;
  totalAmount: number;
  orderDate: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryStatus: DeliveryStatus;
};

export const allOrdersColumn: ColumnDef<AllOrdersColumnType>[] = [
  {
    header: 'Order',
    accessorKey: 'orderNumber',
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className='font-medium text-foreground hover:underline'>
        #{row.original.orderNumber}
      </Link>
    ),
  },
  {
    header: 'Date',
    accessorKey: 'orderDate',
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm'>
        {new Date(row.original.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    header: 'Customer Name',
    accessorKey: 'customerName',
    cell: ({ row }) => {
      return (
        <Link href={`/admin/users/${row.original.userId}`}>
          <div className='flex items-center gap-2'>
            <Image
              src={row.original.avatar ? row.original.avatar : '/avatar-fallback.png'}
              width={30}
              height={30}
              referrerPolicy='no-referrer'
              alt='user avatar'
              className='rounded-full'
            />

            <p>{row.original.customerName}</p>
          </div>
        </Link>
      );
    },
  },

  {
    header: 'Items',
    accessorKey: 'totalItems',
  },
  {
    header: 'Total',
    accessorKey: 'totalAmount',
    cell: ({ row }) => <span className='whitespace-nowrap tabular-nums'>{formatCurrency(row.original.totalAmount)}</span>,
  },

  {
    header: 'Payment Method',
    accessorKey: 'paymentMethod',
    cell: ({ row }) => (row.original.paymentMethod === 'PAYSTACK' ? 'Paystack' : 'Pay on delivery'),
  },
  {
    header: 'Order Status',
    accessorKey: 'orderStatus',
    cell: ({ row }) => <StatusBadge status={row.original.orderStatus} />,
  },

  {
    header: 'Payment Status',
    accessorKey: 'paymentStatus',
    cell: ({ row }) => {
      return <StatusBadge status={row.original.paymentStatus} />;
    },
  },
  {
    header: 'Delivery Status',
    accessorKey: 'deliveryStatus',
    cell: ({ row }) => {
      return <StatusBadge status={row.original.deliveryStatus} />;
    },
  },

  // {
  //   header: 'Action',
  //   accessorKey: 'action',
  //   cell: ({ row }) => <AllCustomersCustomCell row={row} />,
  // },
];
