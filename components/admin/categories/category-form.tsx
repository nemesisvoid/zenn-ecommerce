'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';
import { useForm, Resolver } from 'react-hook-form';
import { CreateCategorySchema } from '@/schemas';

import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Trash2Icon } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createCategory, editCategory } from '@/actions/category.actions';
import Image from 'next/image';
import UploadProductImageWidget from '@/components/cloudinary/upload-image-widget';

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    coverImage: string;
    description?: string;
    products?: { id: string; name: string; images: string[] }[];
  };
  products: { id: string; name: string; images: string[] }[];
}
const CategoryForm = ({ initialData, products }: CategoryFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [tempSelectedProducts, setTempSelectedProducts] = useState<{ id: string; name: string; images: string[]; image?: string }[]>([]);
  console.log('temp', tempSelectedProducts);

  const [searchInput, setSearchInput] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchInput.toLowerCase()));
  }, [products, searchInput]);

  const form = useForm({
    resolver: zodResolver(CreateCategorySchema) as unknown as Resolver<z.infer<typeof CreateCategorySchema>>,
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: '',
          coverImage: '',
          description: '',
          products: [],
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        coverImage: initialData.coverImage,
        name: initialData.name,
        description: initialData.description,
        products: initialData.products || [],
      });
    }
  }, [initialData, form]);
  const { handleSubmit, setValue, watch } = form;

  const watchedCoverImage = watch('coverImage');
  const watchName = watch('name');

  const watchedProducts = watch('products') || [];
  console.log('initialData::', initialData);

  console.log('watched prod:', watchedProducts);

  const removeProduct = (id: string) => {
    const updated = watchedProducts.filter(p => p.id !== id);
    setValue('products', updated, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: z.infer<typeof CreateCategorySchema>) => {
    startTransition(async () => {
      try {
        if (initialData) {
          const res = await editCategory(initialData.id, data);
          if (res?.success) {
            toast.success(res?.message);
            router.push('/admin/categories');
          }
        } else {
          const res = await createCategory(data);
          if (res?.success) {
            router.push('/admin/categories');
            toast.success(res?.message);
          }
          console.log(data);
        }
      } catch (error) {
        toast.error('Error creating category');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, err => console.log('form error', err))}>
        <div className='admin-card rounded-md py-4 px-0 mb-10'>
          <div>
            <h2 className='text-sm font-medium mx-5 mb-2'>Category Information</h2>
          </div>

          <div className='border-b border-gray-300 dark:border-gray-600' />
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-10 mb-10'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name='coverImage'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <div className='w-1/3'>
                          <UploadProductImageWidget
                            onUpload={uploadedUrls => {
                              const newImage = uploadedUrls[0];
                              setValue('coverImage', newImage, { shouldValidate: true });
                            }}
                            title='Category Image'
                            isPending={isPending}
                            isVariant={false}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
        </div>

        <div className='admin-card rounded-md py-4 px-0 mb-10'>
          <div>
            <h2 className='text-sm font-medium mx-5 mb-2'>Products in Category ({watchedProducts.length})</h2>
          </div>

          <div className='border-b border-gray-300 dark:border-gray-600' />

          <div className='p-4'>
            {watchedProducts ? (
              <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4'>
                {watchedProducts.map(product => {
                  const imageSrc = product.image || product.images?.[0];
                  return (
                    <div
                      key={product.id}
                      className='pb-4 shadow-md rounded-xs mb-4'>
                      <div className='relative aspect-square'>
                        <Image
                          src={imageSrc}
                          alt=''
                          fill
                          className='object-cover rounded-xs hover:opacity-80 transition-opacity  duration-300'
                        />
                        {/* <div className='absolute top-1 right-1'>
                        <Button
                          variant='destructive'
                          className='size-8'
                          onClick={() => removeProduct(product.id)}>
                          <Trash2Icon className='w-1 h-2' />
                        </Button>
                      </div> */}
                      </div>
                      <p
                        className='text-sm px-2 text-center mt-5 w-full truncate'
                        title={product.name}>
                        {product.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Add Products to category</p>
            )}

            <Dialog>
              <DialogTrigger
                asChild
                onClick={() => {
                  const currentProducts = form.getValues('products') || [];
                  setTempSelectedProducts(currentProducts);
                }}>
                <Button
                  variant='outline'
                  className='mt-4 mb-4'>
                  Select Products
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Select Products</DialogTitle>
                <DialogHeader>Add Products to category</DialogHeader>

                <Input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder='Search Products...'
                />
                <ul>
                  {filteredProducts.length === 0 && <p>No products found</p>}
                  {filteredProducts.map(product => (
                    <li
                      key={product.id}
                      onClick={() => {
                        const image = product.images[0] || '';
                        console.log('image in loop', image);
                        if (tempSelectedProducts.some(p => p.id === product.id)) {
                          setTempSelectedProducts(prev => prev.filter(p => p.id !== product.id));
                          return;
                        }
                        setTempSelectedProducts(prev => [...prev, { ...product, image }]);
                      }}
                      className='flex items-center justify-between p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer'>
                      {product.name}

                      <div className='size-7 flex items-center justify-center rounded-full bg-black'>
                        {tempSelectedProducts.some(p => p.id === product.id) ? '✔️' : ''}
                      </div>
                    </li>
                  ))}
                </ul>

                <DialogFooter className='flex items-center justify-between '>
                  <DialogClose>
                    <Button
                      className='cursor-pointer'
                      variant='outline'>
                      Cancel
                    </Button>
                  </DialogClose>

                  <DialogClose asChild>
                    <Button
                      type='button'
                      onClick={() => setValue('products', [...tempSelectedProducts])}>
                      Add
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Button
          type='submit'
          disabled={isPending}>
          {!isPending && !initialData ? 'Create Category' : 'Update Category'}
          {isPending && <Loader2Icon className='ml-2 animate-spin' />}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;
