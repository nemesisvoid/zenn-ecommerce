import { getProductBySlug } from '@/actions/product.actions';
import ProductForm from '../../../../../components/admin/products/product-form';
import { getAllCategories } from '@/actions/category.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductDetails from '@/components/product/product-details';
import AdminProductDetails from '@/components/admin/products/admin-product-details';

const AdminProductPage = async (props: { params: Promise<{ slug: string }> }) => {
  const { slug } = await props.params;
  console.log('slug:', slug);

  const product = await getProductBySlug(slug);
  const categories = await getAllCategories();
  if (!product) return <div className='my-50 text-center'>Product not found</div>;
  return (
    <div>
      <Tabs defaultValue='product-details'>
        <TabsList>
          <TabsTrigger
            className='py-4'
            value='product-details'>
            Product Details
          </TabsTrigger>
          <TabsTrigger
            className='py-4'
            value='edit-product'>
            Edit Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value='product-details'>
          <AdminProductDetails product={product} />
        </TabsContent>

        <TabsContent value='edit-product'>
          <ProductForm
            categories={categories}
            initialData={product}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductPage;
