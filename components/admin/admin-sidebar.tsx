'use client';

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { sidebarLinks } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className='backdrop-blur-sm'>
      <SidebarContent className='mt-3 px-3 py-4'>
        <SidebarHeader className='px-2 pb-2'>
          <div className='flex items-center gap-2'>
            <span className='size-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-sm' />
            <span className='font-semibold text-lg bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent'>Zenn Admin</span>
          </div>
        </SidebarHeader>

        <SidebarMenu>
          {sidebarLinks.map(item => {
            const isActive = pathname?.startsWith(item.link);
            return (
              <SidebarMenuItem
                key={item.name}
                className='mb-3'>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.link}
                    title={item.name}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'group relative flex items-center gap-3 rounded-xl  px-3 py-4 transition-all',
                      'outline-none ring-0 focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                      isActive ? 'text-black shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60',
                    ].join(' ')}>
                    <span
                      className={[
                        'flex size-8 items-center justify-center rounded-full transition-all',
                        isActive
                          ? ' text-black '
                          : 'bg-sidebar-accent/50 text-muted-foreground group-hover:text-foreground group-hover:bg-sidebar-accent',
                      ].join(' ')}>
                      <item.icon className='size-4' />
                    </span>
                    <span className={isActive ? 'font-medium' : ''}>{item.name}</span>
                    {/* 
                    {isActive && <span className='absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-white/70' />} */}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
