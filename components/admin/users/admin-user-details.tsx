import Image from 'next/image';
import type { ReactNode } from 'react';
import { BadgeCheckIcon, CalendarIcon, MailIcon, MapPinIcon, PhoneIcon, ReceiptIcon, ShoppingBagIcon, StickyNoteIcon, WalletIcon } from 'lucide-react';
import type { AccountStatus, UserRole } from '@prisma/client';

import { userTransactionColumn, type UserTransactionColumn } from '@/components/admin/table/users/user-transaction-column';
import UserStatCard from '@/components/admin/users/user-stat-card';
import DataTable from '../table/data-table';
import { formatCurrency } from '@/helper/utils';
import { UserType } from '@/types';
import { cn, getInitials } from '@/lib/utils';

interface AdminUserDetailsProps {
  // The page renders a not-found state before mounting this, so the user is always present here.
  // getUserById never returns the password hash.
  user: Omit<NonNullable<UserType>, 'password'>;
  userTransaction: UserTransactionColumn[];
  userStats: {
    totalSpent: number;
    paidOrders: number;
    totalOrders: number;
    deliveredOrders: number;
    lastOrderAt: Date | null;
  };
}

const card = 'rounded-xl border border-border bg-white text-card-foreground shadow-sm dark:bg-dark-100';

const ROLE: Record<UserRole, { label: string; tone: string }> = {
  SUPER_ADMIN: { label: 'Super admin', tone: 'bg-brand-soft text-brand-ink' },
  ADMIN: { label: 'Admin', tone: 'bg-brand-soft text-brand-ink' },
  USER: { label: 'Customer', tone: 'bg-secondary text-muted-foreground' },
};

const STATUS: Record<AccountStatus, { label: string; tone: string }> = {
  ACTIVE: { label: 'Active', tone: 'bg-success/12 text-success' },
  SUSPENDED: { label: 'Suspended', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  BANNED: { label: 'Banned', tone: 'bg-destructive/10 text-destructive' },
};

const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDateTime = (date: Date) =>
  date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Pill = ({ tone, children }: { tone: string; children: ReactNode }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', tone)}>{children}</span>
);

const ContactRow = ({ icon: Icon, label, children }: { icon: typeof MailIcon; label: string; children: ReactNode }) => (
  <li className='flex items-start gap-3'>
    <span className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground'>
      <Icon
        className='size-4'
        aria-hidden='true'
      />
    </span>
    <div className='min-w-0'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <div className='break-words text-sm text-foreground'>{children}</div>
    </div>
  </li>
);

const AdminUserDetails = ({ user, userStats, userTransaction }: AdminUserDetailsProps) => {
  const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const initials = getInitials(user);
  const photo = user.image || user.avatar;
  const isVerified = user.isEmailVerified || !!user.emailVerified;
  const location = [user.address, user.city, user.country].filter(Boolean).join(', ');
  const averageOrder = userStats.paidOrders > 0 ? userStats.totalSpent / userStats.paidOrders : 0;
  const role = ROLE[user.role];
  const status = STATUS[user.status];

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]'>
      {/* Profile */}
      <aside className='space-y-6'>
        <section
          aria-label='Profile'
          className={cn(card, 'overflow-hidden', user.status !== 'ACTIVE' && 'ring-2 ring-destructive/30')}>
          <div
            className='h-24 bg-gradient-to-br from-brand/30 via-brand-soft to-transparent'
            aria-hidden='true'
          />

          <div className='px-6 pb-6'>
            <div className='-mt-10 flex items-end justify-between gap-3'>
              {photo ? (
                <Image
                  src={photo}
                  width={80}
                  height={80}
                  alt=''
                  className='size-20 rounded-full object-cover ring-4 ring-white dark:ring-dark-100'
                />
              ) : (
                <span
                  className='flex size-20 items-center justify-center rounded-full bg-foreground text-xl font-semibold text-background ring-4 ring-white dark:ring-dark-100'
                  aria-hidden='true'>
                  {initials}
                </span>
              )}
              <div className='flex flex-wrap justify-end gap-1.5 pb-1'>
                <Pill tone={role.tone}>{role.label}</Pill>
                <Pill tone={status.tone}>{status.label}</Pill>
              </div>
            </div>

            <h2 className='mt-4 text-lg font-semibold leading-tight text-foreground'>{displayName}</h2>
            <p className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
              {user.email}
              {isVerified && (
                <BadgeCheckIcon
                  className='size-4 shrink-0 text-success'
                  aria-label='Email verified'
                />
              )}
            </p>

            <ul className='mt-6 space-y-4 border-t border-border pt-6'>
              <ContactRow
                icon={MailIcon}
                label='Email'>
                <a
                  href={`mailto:${user.email}`}
                  className='hover:underline'>
                  {user.email}
                </a>
                {!isVerified && <span className='mt-0.5 block text-xs text-amber-700 dark:text-amber-300'>Not verified yet</span>}
              </ContactRow>
              <ContactRow
                icon={PhoneIcon}
                label='Phone'>
                {user.phone ? (
                  <a
                    href={`tel:${user.phone}`}
                    className='hover:underline'>
                    {user.phone}
                  </a>
                ) : (
                  <span className='text-muted-foreground'>Not provided</span>
                )}
              </ContactRow>
              <ContactRow
                icon={MapPinIcon}
                label='Address'>
                {location || <span className='text-muted-foreground'>Not provided</span>}
              </ContactRow>
            </ul>

            <dl className='mt-6 space-y-3 border-t border-border pt-6 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>Member since</dt>
                <dd className='text-foreground'>{formatDate(user.createdAt)}</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>Last login</dt>
                <dd className='text-right text-foreground'>{user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</dd>
              </div>
              <div className='space-y-1'>
                <dt className='text-muted-foreground'>Account ID</dt>
                <dd className='break-all font-mono text-xs text-foreground'>{user.id}</dd>
              </div>
            </dl>

            {user.adminNotes && (
              <div className='mt-6 rounded-lg border-l-2 border-brand bg-brand-soft/60 px-4 py-3'>
                <p className='flex items-center gap-1.5 text-xs font-medium text-brand-ink'>
                  <StickyNoteIcon
                    className='size-3.5'
                    aria-hidden='true'
                  />
                  Internal note
                </p>
                <p className='mt-1 whitespace-pre-line text-sm text-foreground'>{user.adminNotes}</p>
              </div>
            )}
          </div>
        </section>
      </aside>

      {/* Activity */}
      <div className='min-w-0 space-y-6'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <UserStatCard
            title='Total spent'
            text={formatCurrency(userStats.totalSpent)}
            hint={`Across ${userStats.paidOrders} paid ${userStats.paidOrders === 1 ? 'order' : 'orders'}`}
            icon={<WalletIcon className='size-5' />}
          />
          <UserStatCard
            title='Orders'
            text={userStats.totalOrders}
            hint={userStats.lastOrderAt ? `Last on ${formatDate(userStats.lastOrderAt)}` : 'No orders yet'}
            icon={<ShoppingBagIcon className='size-5' />}
          />
          <UserStatCard
            title='Average order'
            text={formatCurrency(averageOrder)}
            hint={`${userStats.deliveredOrders} delivered`}
            icon={<ReceiptIcon className='size-5' />}
          />
        </div>

        <section className={card}>
          <div className='flex items-center justify-between gap-3 border-b border-border px-5 py-4'>
            <h2 className='text-sm font-semibold text-foreground'>Order history</h2>
            <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <CalendarIcon
                className='size-3.5'
                aria-hidden='true'
              />
              Newest first
            </span>
          </div>
          <div className='px-5 py-4'>
            <DataTable
              pageSize={5}
              data={userTransaction}
              columns={userTransactionColumn}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUserDetails;
