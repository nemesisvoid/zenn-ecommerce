'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';

import { PaymentMethod, PaymentStatus, OrderStatus, DeliveryStatus } from '@prisma/client';
import { StatusBadge } from '@/components/misc/status-badge';

import { formatCurrency } from '@/helper/utils';

export type AllOrdersColumnType = {
  id: string;
  customerName: string | null;
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
    header: 'orderId',
    accessorKey: 'id',
  },
  {
    header: 'Customer Name',
    accessorKey: 'customerName',
    cell: ({ row }) => {
      return (
        <Link href={`/admin/customers/${row.original.id}`}>
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
    header: 'Total Items',
    accessorKey: 'totalItems',
  },

  {
    header: 'Payment Method',
    accessorKey: 'paymentMethod',
  },

  {
    header: 'Payment Status',
    accessorKey: 'paymentStatus',
    cell: ({ row }) => {
      const status = (() => {
        switch (row.original.paymentStatus.toLowerCase()) {
          case 'pending':
            return 'bg-yellow-200 text-yellow-900';
          case 'delivered':
            return 'bg-green-200 text-green-900';
          case 'processing':
            return 'bg-blue-200 text-blue-900';
          case 'shipped':
            return 'bg-purple-200 text-purple-900';
          case 'returned':
            return 'bg-red-200 text-red-900';
          default:
            return 'bg-gray-200 text-gray-900';
        }
      })();
      <p className={`${status}`}>{row.original.paymentStatus}</p>;
    },
  },
  {
    header: 'Delivery Status',
    accessorKey: 'deliveryStatus',
    cell: ({ row }) => {
      <StatusBadge status={row.original.deliveryStatus} />;
    },
  },

  // {
  //   header: 'Action',
  //   accessorKey: 'action',
  //   cell: ({ row }) => <AllCustomersCustomCell row={row} />,
  // },
];
