interface AdminStatCardProps {
  title: string;
  text: string | number;
  subtext: string | number;
  icon: React.ReactNode;
  /**
   * Visual variant to theme the card & icon
   */
  variant?: 'revenue' | 'orders' | 'customers' | 'products' | 'neutral';
}
const VARIANT_STYLES: Record<NonNullable<AdminStatCardProps['variant']>, { cardBg?: string; iconWrap: string }> = {
  revenue: {
    // cardBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
  },
  orders: {
    // cardBg: 'bg-sky-50 dark:bg-sky-900/20',
    iconWrap: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
  },
  customers: {
    // cardBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconWrap: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  },
  products: {
    // cardBg: 'bg-violet-50 dark:bg-violet-900/20',
    iconWrap: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
  },
  neutral: {
    cardBg: 'bg-card',
    iconWrap: 'bg-muted text-muted-foreground',
  },
};
const AdminStatCard = ({ title, text, subtext, icon, variant = 'neutral' }: AdminStatCardProps) => {
  const palette = VARIANT_STYLES[variant];
  return (
    <div className={`${palette.cardBg} bg-white rounded-xl shadow-sm px-4 py-3 border border-gray-300`}>
      <div className='flex items-center justify-between gap-5 mb-4'>
        <div>
          <h3 className='text-base'>{title}</h3>
          <span className='text-xs text-muted-foreground'>{subtext}</span>
        </div>
        <div className={`flex items-center justify-center p-2 rounded-full size-10 ${palette.iconWrap}`}>
          {/* Icons should inherit currentColor. Pass icons without inline color. */}
          {icon}
        </div>
      </div>
      <p className='text-2xl'>{text}</p>
    </div>
  );
};
export default AdminStatCard;
