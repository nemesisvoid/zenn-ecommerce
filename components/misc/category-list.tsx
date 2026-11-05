import FadeImage from '../shared/fade-image';
import Link from 'next/link';
import { CategoryListType } from '@/types';
import { cn } from '@/lib/utils';

const CategoryList = ({ data }: { data: CategoryListType }) => {
  return (
    <div className='grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[260px] md:grid-cols-3 md:gap-5'>
      {data.map((item, i) => (
        <CategoryCard
          key={item.id ?? i}
          name={item.name}
          slug={item.slug}
          coverImage={item.coverImage}
          description={item.description}
          featured={i === 0}
        />
      ))}
    </div>
  );
};

type CategoryCardProps = {
  name: string;
  slug: string;
  coverImage: string;
  description?: string | null;
  featured?: boolean;
};

export const CategoryCard = ({ name, slug, coverImage, description, featured }: CategoryCardProps) => {
  return (
    <Link
      href={`/list?category=${slug}`}
      className={cn(
        'group relative isolate flex overflow-hidden rounded-2xl bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        featured && 'sm:col-span-2 md:row-span-2',
      )}>
      <FadeImage
        src={coverImage}
        alt=''
        fill
        sizes={featured ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'}
        className='-z-10 object-cover group-hover:scale-[1.04]'
      />
      {/* Scrim keeps the caption legible on any photo. */}
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/15 to-transparent'
      />
      <div className='mt-auto flex w-full items-end justify-between gap-4 p-5 md:p-6'>
        <div className='min-w-0'>
          <h3 className={cn('font-display leading-none tracking-tight text-white', featured ? 'text-4xl md:text-5xl' : 'text-3xl')}>{name}</h3>
          {featured && description && <p className='mt-3 line-clamp-2 max-w-sm text-sm leading-relaxed text-white/80'>{description}</p>}
        </div>
        <span className='shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#17140f] backdrop-blur transition-colors group-hover:bg-white'>Shop</span>
      </div>
    </Link>
  );
};

export default CategoryList;
