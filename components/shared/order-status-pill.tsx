import { cn } from '@/lib/utils';
import { DeliveryStatus, OrderStatus, PaymentStatus } from '@prisma/client';

type Status = PaymentStatus | DeliveryStatus | OrderStatus;

const SUCCESS: Status[] = ['PAID', 'DELIVERED', 'COMPLETED'];
const DANGER: Status[] = ['FAILED', 'CANCELLED'];
const NEUTRAL: Status[] = ['REFUNDED', 'PARTIALLY_REFUNDED', 'RETURNED'];

export const formatStatus = (value: string) => value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

interface OrderStatusPillProps {
  label?: string;
  status: Status;
  className?: string;
}

const OrderStatusPill = ({ label, status, className }: OrderStatusPillProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
      SUCCESS.includes(status) && 'bg-success/12 text-success',
      DANGER.includes(status) && 'bg-destructive/10 text-destructive',
      NEUTRAL.includes(status) && 'bg-secondary text-muted-foreground',
      ![...SUCCESS, ...DANGER, ...NEUTRAL].includes(status) && 'bg-brand-soft text-brand-ink',
      className,
    )}>
    {label && <span className='opacity-70'>{label}:</span>}
    {formatStatus(status)}
  </span>
);

export default OrderStatusPill;
