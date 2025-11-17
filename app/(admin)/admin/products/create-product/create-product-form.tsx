'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProduct } from '@/actions/product.actions';

import { toast } from 'sonner';
import { useForm, Resolver, UseFormReturn, useFieldArray } from 'react-hook-form';
import { CreateProductSchema } from '@/schemas';

import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2Icon, TrashIcon } from 'lucide-react';
import UploadProductImagWidget from '@/components/cloudinary/upload-image-widget';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { getVariantCombinations } from '@/helper/utils';
import TagInput from '@/components/ui/tag-input';
import ProductVariantForm from './product-variant-form';

const CreateProductForm = ({ categories }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema) as unknown as Resolver<z.infer<typeof CreateProductSchema>>,
    defaultValues: {
      name: '',
      price: 0,
      hasVariants: false,
      description: '',
      categories: [],
      images: [],
      stock: 0,
      discountPercent: 0,
      variants: [],
    },
  });
  const { handleSubmit, setValue } = form;
  console.log(form.watch('hasVariants'));

  const onSubmit = async (data: z.infer<typeof CreateProductSchema>) => {
    startTransition(async () => {
      const res = await createProduct(data);

      if (!res?.success) {
        toast.error(res?.message);
        throw new Error(res?.message);
      }
      toast.success(res?.message);
      router.push(res.data.slug);
    });
    console.log('submitted data:', data);
  };

  const watchedImages = form.watch('images');
  console.log('watched images:', watchedImages);

  return (
    <Form {...form}>
      <form
        action=''
        onSubmit={handleSubmit(onSubmit)}>
        {/*  PRODUCT FORM */}
        <div className='bg-white text-gray-600 rounded-md py-4 mb-10'>
          <div>
            <h2 className='text-sm font-medium mx-5 mb-2'>Product Information</h2>
          </div>

          <div className='border-b border-gray-400' />

          <div className='space-y-5 p-6'>
            <div
              className='flex items-center gap-10
          mb-10'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='w-1/2'>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className='text-black/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='categories'
                render={({ field }) => {
                  const selectedIds = field.value || [];

                  return (
                    <FormItem className='w-full'>
                      <FormLabel>Product Categories</FormLabel>

                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className='flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border px-3 py-2 cursor-pointer'>
                              {selectedIds.length > 0 ? (
                                selectedIds.map(id => {
                                  const cat = categories.find(c => c.id === id);
                                  return (
                                    <Badge
                                      key={id}
                                      className='rounded-full px-3 py-1 text-sm flex items-center gap-2'>
                                      {cat?.name}
                                      <button
                                        type='button'
                                        onClick={e => {
                                          e.stopPropagation();
                                          field.onChange(selectedIds.filter(x => x !== id));
                                        }}
                                        className='text-xs opacity-70 hover:opacity-100'>
                                        ✕
                                      </button>
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className='text-muted-foreground'>Select categories...</span>
                              )}
                            </div>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className='p-0 w-[300px]'>
                          <Command>
                            <CommandInput placeholder='Search categories...' />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {categories.map(category => {
                                  const isSelected = selectedIds.includes(category.id);

                                  return (
                                    <CommandItem
                                      key={category.id}
                                      value={category.name}
                                      onSelect={() => {
                                        if (isSelected) {
                                          field.onChange(selectedIds.filter(x => x !== category.id));
                                        } else {
                                          field.onChange([...selectedIds, category.id]);
                                        }
                                      }}>
                                      <div className={`mr-2 h-4 w-4 rounded-sm border ${isSelected ? 'bg-primary' : 'opacity-50'}`} />
                                      {category.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* <FormField
                control={form.control}
                name='categories'
                render={({ field }) => (
                  <FormItem className='w-1/2'>
                    <FormLabel>Product Categories</FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-between'>
                          {field.value?.length ? ` selected ${field.value}` : 'Select categories'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-full p-2'>
                        <div className='flex flex-col space-y-2 max-h-60 overflow-y-auto'>
                          {categories.map(category => {
                            const isSelected = field.value?.includes(category.id);

                            return (
                              <div
                                key={category.id}
                                className='flex items-center gap-2 cursor-pointer'
                                onClick={() => {
                                  let newValue = [];

                                  if (isSelected) {
                                    // remove
                                    newValue = field.value.filter(id => id !== category.id);
                                  } else {
                                    // add
                                    newValue = [...(field.value ?? []), category.id];
                                  }

                                  field.onChange(newValue);
                                }}>
                                <input
                                  type='checkbox'
                                  checked={isSelected}
                                  readOnly
                                  className='cursor-pointer'
                                />
                                <span>{category.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            <div className='grid grid-cols-3 grid-rows-2 gap-6 mb-10'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        className='text-black/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='discountPercent'
                render={({ field }) => (
                  <FormItem className=''>
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={Number(field.value)}
                        type='number'
                        className='text-black/60'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='stock'
                render={({ field }) => (
                  <FormItem className='w-1/2'>
                    <FormLabel>Available Stock</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        className='text-black/60'
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
                  <FormItem className='col-span-2'>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className='text-black/80 bg-gray-100'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem className='w-1/3'>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <UploadProductImagWidget
                      onUpload={uploadedUrls => {
                        const newImages = [...watchedImages, ...uploadedUrls];
                        setValue('images', newImages, { shouldValidate: true });
                      }}
                      isVariant={false}
                      isPending={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/*  PRODUCT VARIANTS FORM */}
        <div className='bg-white text-gray-600 rounded-md py-4 mb-10'>
          <h2 className='text-sm font-medium mx-5 mb-2'>Product Variant</h2>
          <div className='border-b border-gray-400' />

          <div className='space-y-6 p-6'>
            <div>
              <FormField
                control={form.control}
                name='hasVariants'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormLabel>Does this product have variants?</FormLabel>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        className='w-4 h-4'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('hasVariants') && (
                <ProductVariantForm
                  form={form}
                  isPending={isPending}
                />
              )}
            </div>
          </div>
        </div>

        <div className='bg-white text-gray-600 rounded-md px-3 py-1 flex mb-20'>
          <div className='my-4 ml-auto'>
            <Button
              className='text-lg p-6 cursor-pointer'
              type='submit'>
              {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : 'Create Product'}
            </Button>
          </div>
        </div>
        {/*  SUBMIT BUTTON */}
      </form>
    </Form>
  );
};

export default CreateProductForm;
