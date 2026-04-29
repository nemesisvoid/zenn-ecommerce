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
    header: 'Order Id',
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
