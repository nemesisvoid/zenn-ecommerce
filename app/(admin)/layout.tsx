import { auth } from '@/auth';
import AdminInfo from '@/components/admin/admin-info';

import AdminSidebar from '@/components/admin/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const session = await auth();
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className='overflow-x-hidden dark:bg-[#22282E] bg-[#F9F7F7] w-full h-full px-5 py-5'>
        <AdminInfo session={session} />
        <div className='min-h-screen'>{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
