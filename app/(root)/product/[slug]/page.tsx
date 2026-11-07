import { getProductBySlug } from '@/actions/product.actions';
import ProductDetails from '@/components/product/product-details';
import ProductNotFound from '@/components/product/product-not-found';
import PageBreadcrumb from '@/components/shared/page-breadcrumb';

async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return <ProductNotFound />;

  return (
    <div className='container'>
      <PageBreadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/list' }, { label: product.name }]}
        className='mb-6 md:mb-8'
      />
      <ProductDetails
        product={product}
      />
    </div>
  );
}

export default ProductDetailsPage;
