import React from 'react';
import ProductList from '../product/product-list';
import { getProductsByNewArrivals } from '@/actions/product.actions';
import SectionHeading from '../shared/section-heading';

const NewArrivalsSection = async () => {
  const products = await getProductsByNewArrivals();
  return (
    <section
      aria-labelledby='new-arrivals'
      className='container mt-24 md:mt-32'>
      <SectionHeading
        id='new-arrivals'
        title='New arrivals'
        description='The latest additions to the store.'
        href='/new-arrivals'
        linkLabel='See all new arrivals'
      />
      <ProductList
        data={products}
        limit={8}
      />
    </section>
  );
};

export default NewArrivalsSection;
