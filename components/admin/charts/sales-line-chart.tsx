'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SalesLineChartProps {
  month: string;
  revenue: number;
}

const SalesLineChart = ({ data }: { data: SalesLineChartProps[] }) => {
  const monthTick = (value: string) => {
    const [y, m] = value.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: 'short' }); // Jan, Feb...
  };

  const formatCurrencyFull = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  const formatCurrencyCompact = (n: number) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

  return (
    <ResponsiveContainer
      width='100%'
      height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />

        <XAxis
          dataKey='month'
          tickFormatter={monthTick}
          interval='preserveStartEnd'
        />

        <YAxis
          domain={[0, 'auto']}
          allowDecimals
          tickFormatter={v => formatCurrencyCompact(Number(v))}
          tickMargin={8}
        />

        <Tooltip formatter={v => [formatCurrencyFull(Number(v)), 'Revenue']} />

        <Line
          type='monotone'
          dataKey='revenue'
          stroke='#8884d8'
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesLineChart;
