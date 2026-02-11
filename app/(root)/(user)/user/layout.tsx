import Link from 'next/link';

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const menuItems = [
    { label: 'Profile', href: '/user/settings/profile' },
    { label: 'Orders', href: '/user/settings/orders' },
    { label: 'Wishlist', href: '/user/settings/wishlist' },
    { label: 'Account', href: '/user/settings/account' },
  ];
  return (
    <div className='container flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 gap-2'>
      <aside className='md:w-64 flex-shrink-0'>
        <nav className='flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-6 py-6'>
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className='justify-start px-4 py-2 text-base font-medium hover:bg-gray-100 rounded-md transition-colors dark:hover:bg-dark-100'>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className='flex-1 lg:max-w-full bg-white p-8 dark:bg-dark-100'>{children}</div>
    </div>
  );
};

export default UserLayout;
