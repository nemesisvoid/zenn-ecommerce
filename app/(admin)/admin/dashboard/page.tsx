import { getMonthlySales, getOrderSummary } from '@/actions/order.action';
import AdminHeader from '@/components/admin/admin-header';
import AdminStatCard from '@/components/admin/admin-stat-card';
import SalesLineChart from '@/components/admin/charts/sales-line-chart';
import { dashboardProductColumn } from '@/components/admin/tables/products/dashboard-product-column';

import DashboardProductTable from '@/components/admin/tables/products/dashboard-product-table';
import { dashboardSaleColumn } from '@/components/admin/tables/sales/dashboard-sale-column';
import DashboardSaleTable from '@/components/admin/tables/sales/dashboard-sale-table';
import { formatCurrency } from '@/helper/utils';
import { BoxIcon, DollarSignIcon, ShoppingBasketIcon, UsersRoundIcon } from 'lucide-react';
import React from 'react';

const AdminDashboardPage = async () => {
  const data = await getOrderSummary();
  const stats = await getMonthlySales();
  console.log(stats);
  console.log(data.topProducts);
  console.log(data.recentSales);
  const topProducts = data.topProducts?.map(p => ({
    name: p.name,
    totalOrders: p._count.OrderItem,
    image: p.images[0],
    price: p.price,
  }));

  const recentSales = data.recentSales?.map(s => ({
    ...s,
    orderId: s.id,
    customerName: s.user.name,
    totalPrice: s.totalPrice,
    orderDate: s.createdAt.toDateString(),
    address: s.shippingAddress,
  }));
  return (
    <div>
      <AdminHeader
        title='Dashboard'
        text='Overview of overall data'
      />

      <div className='flex items-center justify-between gap-10 max-md:flex-wrap mb-10'>
        <AdminStatCard
          title='Total Revenue'
          text={formatCurrency(data.totalSales)}
          subtext='+5% from last month'
          variant='revenue'
          icon={<DollarSignIcon size={18} />}
        />

        <AdminStatCard
          title='Total Orders'
          text={data.totalOrders}
          subtext='+5% from last month'
          variant='orders'
          icon={<ShoppingBasketIcon size={18} />}
        />

        <AdminStatCard
          title='Total Customers'
          text={data.totalUsers}
          subtext='+5% from last month'
          variant='customers'
          icon={<UsersRoundIcon size={18} />}
        />

        <AdminStatCard
          title='Total Products'
          text={data.totalProducts}
          subtext='+5% from last month'
          variant='products'
          icon={<BoxIcon size={20} />}
        />
      </div>

      <div className='flex flex-col lg:flex-row gap-10 w-full mb-10'>
        <div
          className='bg-white pr-10 
        w-1/2 rounded-2xl py-4 shadow-sm'>
          <h2 className='text-lg text-gray-600 translate-x-10 mb-5'>Revenue</h2>

          <SalesLineChart data={stats} />
        </div>

        <div
          className='bg-white px-8 
        w-1/2 rounded-xl py-4 border border-gray-300 shadow-sm'>
          <h2 className='text-lg text-gray-600 translate-x-4'>Top products</h2>
          <DashboardProductTable
            columns={dashboardProductColumn}
            data={topProducts}
          />
        </div>
      </div>

      <div
        className='bg-white 
        w-full rounded-xl py-4 border border-gray-300 shadow-sm'>
        <h2>Recent sales</h2>
        <DashboardSaleTable
          columns={dashboardSaleColumn}
          data={recentSales}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
