import Image from 'next/image';
import Link from 'next/link';
import { ImagesIcon, PlusIcon } from 'lucide-react';

import { getAllBanners } from '@/actions/banner.actions';
import { BannerActiveSwitch, BannerRowActions } from '@/components/admin/banners/banner-row-actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type BannerStatus = 'Live' | 'Scheduled' | 'Ended' | 'Hidden';

const getStatus = (banner: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }, now: Date): BannerStatus => {
  if (!banner.isActive) return 'Hidden';
  if (banner.startsAt && banner.startsAt > now) return 'Scheduled';
  if (banner.endsAt && banner.endsAt <= now) return 'Ended';
  return 'Live';
};

const statusStyles: Record<BannerStatus, string> = {
  Live: 'bg-success/12 text-success',
  Scheduled: 'bg-brand-soft text-brand-ink',
  Ended: 'bg-secondary text-muted-foreground',
  Hidden: 'bg-secondary text-muted-foreground',
};

const formatDate = (date: Date) => date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const schedule = (startsAt: Date | null, endsAt: Date | null) => {
  if (!startsAt && !endsAt) return 'Always';
  if (startsAt && endsAt) return `${formatDate(startsAt)} – ${formatDate(endsAt)}`;
  if (startsAt) return `From ${formatDate(startsAt)}`;
  return `Until ${formatDate(endsAt!)}`;
};

const BannersPage = async () => {
  const banners = await getAllBanners();
  const now = new Date();
  const liveCount = banners.filter(b => getStatus(b, now) === 'Live').length;

  return (
    <div>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold text-foreground'>Homepage banners</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {banners.length === 0
              ? 'The slides at the top of your homepage.'
              : `${liveCount} of ${banners.length} live. Lower positions show first.`}
          </p>
        </div>
        <Button asChild>
          <Link href='/admin/banners/create'>
            <PlusIcon
              className='size-4'
              aria-hidden='true'
            />
            New banner
          </Link>
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className='admin-card flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <span className='flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground'>
            <ImagesIcon
              className='size-6'
              aria-hidden='true'
            />
          </span>
          <h2 className='mt-4 font-semibold text-foreground'>No banners yet</h2>
          <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
            Until you add one, the homepage shows the built-in default slides.
          </p>
          <Button
            asChild
            className='mt-6'>
            <Link href='/admin/banners/create'>Create your first banner</Link>
          </Button>
        </div>
      ) : (
        <ul className='admin-card divide-y divide-border overflow-hidden rounded-xl border border-border'>
          {banners.map(banner => {
            const status = getStatus(banner, now);
            return (
              <li
                key={banner.id}
                className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center'>
                <div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40'>
                  <Image
                    src={banner.imageUrl}
                    alt=''
                    fill
                    sizes='160px'
                    className='object-cover'
                  />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Link
                      href={`/admin/banners/${banner.id}`}
                      className='truncate font-medium text-foreground hover:underline'>
                      {banner.title}
                    </Link>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>{status}</span>
                  </div>
                  <p className='mt-1 truncate text-sm text-muted-foreground'>
                    {banner.ctaLabel} → <span className='font-mono text-xs'>{banner.href}</span>
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Position {banner.sortOrder} · {schedule(banner.startsAt, banner.endsAt)}
                  </p>
                </div>

                <div className='flex items-center justify-between gap-4 sm:justify-end'>
                  <BannerActiveSwitch
                    id={banner.id}
                    title={banner.title}
                    isActive={banner.isActive}
                  />
                  <BannerRowActions
                    id={banner.id}
                    title={banner.title}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BannersPage;
