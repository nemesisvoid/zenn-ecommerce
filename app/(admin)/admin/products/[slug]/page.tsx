import { getProductBySlugForAdmin } from '@/actions/product.actions';
import ArchiveProductButton from '@/components/admin/products/archive-product-button';
import ProductForm from '../../../../../components/admin/products/product-form';
import { getAllCategories } from '@/actions/category.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminProductDetails from '@/components/admin/products/admin-product-details';

const AdminProductPage = async (props: { params: Promise<{ slug: string }> }) => {
  const { slug } = await props.params;

  const product = await getProductBySlugForAdmin(slug);
  const categories = await getAllCategories();
  if (!product) return <div className='my-50 text-center'>Product not found</div>;
  return (
    <div>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        {product.isArchived ? (
          <p className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/30 dark:text-amber-300'>
            This product is archived and hidden from the store.
          </p>
        ) : (
          <span />
        )}
        <ArchiveProductButton
          id={product.id}
          name={product.name}
          isArchived={product.isArchived}
          variant='full'
        />
      </div>
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
