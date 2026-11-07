'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLinkIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import BrandMark from '@/components/shared/brand-mark';
import Logo from '@/components/shared/logo';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

type NavLink = (typeof sidebarLinks)[number];

const GROUPS: { label: string; links: string[] }[] = [
  { label: 'Overview', links: ['/admin/dashboard', '/admin/activities'] },
  { label: 'Catalogue', links: ['/admin/products', '/admin/categories', '/admin/banners'] },
  { label: 'Sales', links: ['/admin/orders', '/admin/users'] },
];
const FOOTER_LINKS = ['/admin/settings'];

const byLink = (links: string[]) => links.map(link => sidebarLinks.find(item => item.link === link)).filter((item): item is NavLink => !!item);

const AdminSidebar = () => {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const renderItem = (item: NavLink) => {
    const isActive = pathname === item.link || pathname?.startsWith(`${item.link}/`);
    return (
      <SidebarMenuItem key={item.link}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.name}
          className={cn(
            'relative h-10 gap-3 rounded-lg px-3 text-[0.9rem] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
            'data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-foreground',
          )}>
          <Link
            href={item.link}
            onClick={closeOnMobile}
            aria-current={isActive ? 'page' : undefined}>
            {isActive && (
              <span
                className='absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand group-data-[collapsible=icon]:hidden'
                aria-hidden='true'
              />
            )}
            <item.icon
              className={cn('size-[18px]', isActive && 'text-brand-ink')}
              aria-hidden='true'
            />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'>
      <SidebarHeader className='px-3 pb-2 pt-4'>
        <div className={cn('flex h-10 items-center', collapsed ? 'justify-center' : 'justify-between gap-2 px-1')}>
          {collapsed ? (
            <Link
              href='/admin/dashboard'
              aria-label='Zenn admin home'
              className='rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'>
              <BrandMark className='size-8' />
            </Link>
          ) : (
            <>
              <Logo
                href='/admin/dashboard'
                className='text-[1.75rem]'
              />
              <span className='rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
                Admin
              </span>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className='px-1'>
        {GROUPS.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className='text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80'>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-1'>{byLink(group.links).map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border px-3 py-3'>
        <SidebarMenu className='gap-1'>
          {byLink(FOOTER_LINKS).map(renderItem)}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip='View store'
              className='h-10 gap-3 rounded-lg px-3 text-[0.9rem] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'>
              <Link
                href='/'
                target='_blank'>
                <ExternalLinkIcon
                  className='size-[18px]'
                  aria-hidden='true'
                />
                <span>View store</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;
