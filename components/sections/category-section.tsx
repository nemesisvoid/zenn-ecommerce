import { getAllCategories } from '@/actions/category.actions';
import React from 'react';
import CategoryList from '../misc/category-list';

const CategorySection = async () => {
  const categoryList = await getAllCategories();
  return (
    <section className='container mt-20 mb-40'>
      <h2 className='text-3xl text-center font-medium uppercase mb-10'>Browse by Categories</h2>
      <CategoryList data={categoryList} />
    </section>
  );
};

export default CategorySection;
