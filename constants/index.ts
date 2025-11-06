import {
  BoxIcon,
  ChartBarBigIcon,
  ChartBarIcon,
  ChartBarIncreasingIcon,
  ChartBarStackedIcon,
  DollarSignIcon,
  HomeIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UsersIcon,
} from 'lucide-react';

export const navLinks = [
  {
    name: 'Shop',
    link: '/shop',
  },
  {
    name: 'New Arrivals',
    link: '/new-arrivals',
  },
  {
    name: 'On Sale',
    link: '/on-sale',
  },
];

export const footerNav = [
  {
    name: 'Shop',
    link: '/shop',
  },
  {
    name: 'New Arrivals',
    link: '/new-arrivals',
  },
  {
    name: 'On Sale',
    link: '/on-sale',
  },
];

export const sidebarLinks = [
  {
    name: 'Dashboard',
    link: '/admin/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Analytics',
    link: '/admin/analytics',
    icon: ChartBarIncreasingIcon,
  },
  {
    name: 'Products',
    link: '/admin/products',
    icon: BoxIcon,
  },
  {
    name: 'Categories',
    link: '/admin/categories',
    icon: ChartBarStackedIcon,
  },
  {
    name: 'Sales',
    link: '/admin/sales',
    icon: DollarSignIcon,
  },
  {
    name: 'Customers',
    link: '/admin/customers',
    icon: UsersIcon,
  },
  {
    name: 'Orders',
    link: '/admin/orders',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Settings',
    link: '/admin/settings',
    icon: SettingsIcon,
  },
];

export const PaymentMethods = ['PAYONDELIVERY', 'PAYSTACK'];
