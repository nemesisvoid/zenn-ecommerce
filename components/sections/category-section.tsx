import { getAllCategories } from '@/actions/category.actions';
import React from 'react';
import CategoryList from '../misc/category-list';
import SectionHeading from '../shared/section-heading';

const CategorySection = async () => {
  const categoryList = await getAllCategories();
  return (
    <section
      aria-labelledby='shop-by-category'
      className='container mt-24 mb-8 md:mt-32'>
      <SectionHeading
        id='shop-by-category'
        title='Shop by category'
        description='Find what you came for, faster.'
      />
      <CategoryList data={categoryList} />
    </section>
  );
};

export default CategorySection;
