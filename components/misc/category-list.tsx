import React from 'react';

import { CategoryListType } from '@/types';
import Link from 'next/link';
const CategoryList = ({ data }: { data: CategoryListType }) => {
  return (
    <div className='grid grid-cols-3 gap-8'>
      {data.map((item, i) => (
        <Link
          className={`h-64 inline-block hover:scale-105  transition-all duration-300 ${i === 0 && 'col-span-2'}`}
          key={i}
          href={`/list?category=${item.slug}`}>
          <div
            style={{
              backgroundImage: `url(${item.coverImage})`,
            }}
            className='relative h-full bg-cover bg-center rounded-md'>
            <p className='absolute text-2xl text-black uppercase top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>{item.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
