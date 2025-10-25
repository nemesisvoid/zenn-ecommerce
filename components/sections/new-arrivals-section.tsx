import React from 'react';
import ProductList from '../product/product-list';
import { getProductsByNewArrivals } from '@/actions/product.actions';

const NewArrivalsSection = async () => {
  const products = await getProductsByNewArrivals();
  console.log(products);
  return (
    <section className='container mt-24 mb-40'>
      <h2 className='section-header'>New Arrivals</h2>
      <ProductList data={products} />
    </section>
  );
};

export default NewArrivalsSection;
