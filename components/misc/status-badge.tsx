import { cn } from '@/lib/utils';
import { PaymentStatus, OrderStatus, DeliveryStatus } from '@prisma/client';

type StatusBadgeType = PaymentStatus | OrderStatus | DeliveryStatus;

interface StatusBadgeProps {
  status: StatusBadgeType;
}

const statusConfig: Record<StatusBadgeType, string> = {
  // PaymentStatus & OrderStatus PENDING
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',

  // PaymentStatus
  PAID: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
  PARTIALLY_REFUNDED: 'bg-indigo-100 text-indigo-800 border-indigo-200',

  // OrderStatus
  CONFIRMED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',

  // DeliveryStatus
  PROCESSING: 'bg-orange-100 text-orange-800 border-orange-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  RETURNED: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', statusConfig[status])}>
      {status.replace('_', ' ')}
    </span>
  );
};
