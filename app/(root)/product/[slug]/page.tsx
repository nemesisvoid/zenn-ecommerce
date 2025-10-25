import { getCart } from '@/actions/cart.actions';
import { getProductBySlug } from '@/actions/product.actions';
import ProductDetails from '@/components/product/product-details';
import ProductNotFound from '@/components/product/product-not-found';

async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  const cart = await getCart();
  console.log(product);
  if (!product) return <ProductNotFound />;

  return (
    <div className='container mt-4 mb-35'>
      <ProductDetails
        product={product}
        cart={cart}
      />
    </div>
  );
}

export default ProductDetailsPage;
