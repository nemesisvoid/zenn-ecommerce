import { getAllCategories } from '@/actions/category.actions';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const CategoriesPage = async () => {
  const categories = await getAllCategories();
  console.log('cat', categories);

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='mb-6'>Categories List</h3>
        <Button asChild>
          <Link
            href='/admin/categories/create-category'
            className='lg:mr-5'>
            Add Category
          </Link>
        </Button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {!categories.length && <p>No categories found</p>}
        {categories.map(cat => (
          <Link
            href={`/admin/categories/${cat.slug}`}
            key={cat.id}>
            <div className='admin-card px-4 rounded-md shadow-sm'>
              <div className='relative aspect-square w-full '>
                <Image
                  src={cat.coverImage}
                  alt='category image'
                  fill
                  className='w-full rounded-md object-cover'
                />
              </div>

              <p className='text-base text-center mt-3'>{cat.name}</p>
            </div>
          </Link>
        ))}

        {/* <div className='bg-white'>
          <Link
            href='/admin/categories/create-category'
            className='text-3xl font-bold flex items-center justify-center h-full'>
            +
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default CategoriesPage;
