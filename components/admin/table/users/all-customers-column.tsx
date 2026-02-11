'use client';

import { formatCurrency } from '@/helper/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import AllCustomersCustomCell from './all-customers-custom-cell';
import Link from 'next/link';

export type AllCustomersColumnType = {
  id: string;
  name: string;
  email: string;
  paymentMethod: string;
  avatar: string;
  totalOrders: number;
  lastOrderDate: Date;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: Date | null;
  avgOrderValue?: number;
};

export const allCustomersColumn: ColumnDef<AllCustomersColumnType>[] = [
  {
    header: 'Customer Name',
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <Link href={`/admin/users/${row.original.id}`}>
          <div className='flex items-center gap-2'>
            <Image
              src={row.original.avatar ? row.original.avatar : '/avatar-fallback.png'}
              width={30}
              height={30}
              referrerPolicy='no-referrer'
              alt='user avatar'
              className='rounded-full'
            />

            <p>{row.original.name}</p>
          </div>
        </Link>
      );
    },
  },

  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Email Verified',
    accessorKey: 'isEmailVerified',
    cell: ({ row }) => (
      <div>
        {row.original.isEmailVerified ? (
          <p className='bg-green-200 text-xs text-green-900 px-3 py-2 rounded-full w-fit'>Verified</p>
        ) : (
          <p className='bg-red-200 text-xs text-red-800 px-3 py-2 rounded-full w-fit'>Unverified</p>
        )}
      </div>
    ),
  },

  {
    header: 'Total Orders',
    accessorKey: 'totalOrders',
  },
  {
    header: 'Avg Order Value',
    accessorKey: 'avgOrderValue',
    cell: ({ row }) => <p>{row.original.avgOrderValue ? formatCurrency(row.original.avgOrderValue) : '-'}</p>,
  },

  {
    header: 'Last Order Date',
    accessorKey: 'lastOrderDate',
    cell: ({ row }) => <p>{row.original.lastOrderDate ? row.original.lastOrderDate.toDateString() : '-'}</p>,
  },

  {
    header: 'Payment Method',
    accessorKey: 'paymentMethod',
  },

  // helper to choose distinct badge color per role
  {
    header: 'Role',
    accessorKey: 'role',
    cell: ({ row }) => {
      const role = row.original.role ?? 'unknown';
      const badgeClass = (() => {
        switch (role.toLowerCase()) {
          case 'admin':
            return 'bg-blue-200 text-blue-900';
          case 'manager':
            return 'bg-amber-200 text-amber-900';
          case 'vendor':
            return 'bg-purple-200 text-purple-900';
          case 'guest':
            return 'bg-slate-200 text-slate-900';
          default:
            return 'bg-gray-200 text-gray-800';
        }
      })();

      return (
        <div>
          <p className={`${badgeClass} text-xs px-3 py-2 rounded-full w-fit`}>{role}</p>
        </div>
      );
    },
  },
  {
    header: 'Action',
    accessorKey: 'action',
    cell: ({ row }) => <AllCustomersCustomCell row={row} />,
  },
];
