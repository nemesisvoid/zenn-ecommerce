import { useState } from 'react';

import * as z from 'zod';
import { getVariantCombinations } from '@/helper/utils';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { CreateProductSchema } from '@/schemas';
import { Input } from '@/components/ui/input';
import TagInput from '@/components/ui/tag-input';

import { Button } from '@/components/ui/button';
import { TrashIcon, XIcon } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import UploadProductImagWidget from '@/components/cloudinary/upload-image-widget';

interface ProductVariantFormProps {
  form: UseFormReturn<z.infer<typeof CreateProductSchema>>;
  isPending: boolean;
}
const ProductVariantForm = ({ form, isPending }: ProductVariantFormProps) => {
  const [options, setOptions] = useState<{ id: number; name: string; values: string[] }[]>([
    { id: 1, name: 'Color', values: [] },
    { id: 2, name: 'Size', values: [] },
  ]);

  const { control, getValues } = form;

  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'variants',
  });

  const { fields: colorImageFields, replace: replaceColorImages } = useFieldArray({
    control,
    name: 'colorImages',
  });

  const watchedColorImages = form.watch('colorImages');
  const existingColorImage = getValues('colorImages') || [];

  const handleOptionChange = (optionId: number, newValues: string[]): void => {
    setOptions(currentOptions => currentOptions.map(opt => (opt.id === optionId ? { ...opt, values: newValues } : opt)));
  };

  console.log('watchedColorImages', watchedColorImages);

  const handleSaveOptions = () => {
    const colorOption = options.find(option => option.name.toLowerCase() === 'color');

    if (colorOption && colorOption.values.length > 0) {
      const existingColorImage = getValues('colorImages') || [];

      const newColorImages = colorOption.values.map(colorName => {
        const existing = existingColorImage.find(img => img.color === colorName);
        return {
          color: colorName,
          images: existing ? existing.images : [],
        };
      });

      replaceColorImages(newColorImages);
    }
  };

  const handleGenerateVariants = () => {
    const allValues = options.map(option => option.values);

    const combinations = getVariantCombinations(allValues);

    const newVariants = combinations.map(combo => ({
      color: combo[0],
      size: combo[1],
      price: 0,
      stock: 0,
      sku: null,
    }));

    replace(newVariants);
    console.log('new Var:', newVariants);
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className='my-3'>Add Options</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Options</DialogTitle>
            <DialogDescription>Add product variants</DialogDescription>

            {options.map(option => (
              <div key={option.id}>
                <p className='mb-2'>{option.name}</p>
                <TagInput
                  onChange={newValues => handleOptionChange(option.id, newValues)}
                  placeholder={`add ${option.name}`}
                  value={option.values}
                />
              </div>
            ))}
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type='button'
                onClick={handleSaveOptions}>
                Save changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='flex flex-wrap gap-2'>
        {options.map(
          opt =>
            opt.values.length > 0 && (
              <div
                key={opt.id}
                className='bg-gray-100 px-3 py-1 rounded text-sm my-5'>
                <span className='font-semibold'>{opt.name}:</span> {opt.values.join(', ')}
              </div>
            )
        )}
      </div>

      {colorImageFields.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Color Images</h3>
          <p className='text-sm text-muted-foreground'>Upload images for each color variant.</p>

          <Accordion
            type='single'
            collapsible
            className='w-1/2 border rounded-md'>
            {colorImageFields.map((field, index) => {
              const images = watchedColorImages?.[index]?.images || [];
              return (
                <AccordionItem
                  key={field.id}
                  value={field.id}>
                  <AccordionTrigger className='px-4 hover:no-underline hover:bg-gray-50'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-4 h-4 rounded-full bg-gray-200'
                        style={{
                          backgroundColor: field.color,
                        }}
                      />
                      <span>{field.color}</span>
                      <span className='text-xs text-gray-400 ml-2'>({images.length || 0} images)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='p-4 bg-gray-50'>
                    <FormField
                      control={control}
                      name={`colorImages.${index}.images`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormControl>
                            <div>
                              <UploadProductImagWidget
                                isPending={isPending}
                                isVariant={true}
                                onUpload={newUrls => {
                                  // Append new URLs to existing ones
                                  const current = getValues(`colorImages.${index}.images`) || [];
                                  formField.onChange([...current, ...newUrls]);
                                }}
                              />
                              {formField.value && formField.value.length > 0 && (
                                <div className='flex flex-wrap gap-2 mt-2'>
                                  {formField.value.map((url: string, i: number) => (
                                    <div
                                      key={i}
                                      className='relative w-16 h-16 rounded-md overflow-hidden border'>
                                      <div
                                        className='absolute top-0 right-0 z-10 bg-red-500 text-white rounded-bl-md cursor-pointer p-1'
                                        onClick={() => formField.onChange(formField.value.filter((_, index) => index !== i))}>
                                        <XIcon size={10} />
                                      </div>
                                      <img
                                        src={url}
                                        alt='variant'
                                        className='object-cover w-full h-full'
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      <hr className='my-6' />

      {/* Your "Generate Variants" button */}
      <Button
        type='button'
        onClick={handleGenerateVariants}
        className='mb-6'>
        Generate Variants
      </Button>

      {fields.length > 0 && (
        <div className='border rounded-md overflow-hidden'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-100 border-b'>
              <tr>
                <th className='p-3'>Color</th>
                <th className='p-3'>Size</th>
                <th className='p-3 w-32'>Price</th>
                <th className='p-3 w-32'>Stock</th>
                <th className='p-3 w-20'></th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {fields.map((field, index) => (
                <tr
                  key={field.id}
                  className='hover:bg-gray-50'>
                  <td className='p-3 font-medium'>{form.watch(`variants.${index}.color`)}</td>
                  <td className='p-3'>{form.watch(`variants.${index}.size`)}</td>
                  <td className='p-3'>
                    <FormField
                      control={control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type='number'
                          className='h-8'
                        />
                      )}
                    />
                  </td>
                  <td className='p-3'>
                    {/* Assuming you added stock to schema */}
                    <FormField
                      control={control}
                      name={`variants.${index}.stock`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type='number'
                          className='h-8'
                        />
                      )}
                    />
                  </td>
                  <td className='p-3'>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => remove(index)}
                      className='text-red-500 hover:text-red-700'>
                      <TrashIcon className='w-4 h-4' />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductVariantForm;

// previous code

// <div>
//   {fields.map((field, index) => {
//     const variantImages = form.watch(`variants.${index}.images`) || [];
//     console.log({ variantImages });
//     return (
//       <div
//         className='my-10'
//         key={field.id}>
//         <div className='flex items-center max-md:flex-wrap gap-3 mb-4'>
//           <FormField
//             control={control}
//             name={`variants.${index}.size`}
//             render={({ field }) => {
//               const { value, ...rest } = field;

//               return (
//                 <FormItem className='w-1/2'>
//                   <FormLabel>Variant Size</FormLabel>

//                   <FormControl>
//                     <Input
//                       value={value ?? ''}
//                       {...rest}
//                       placeholder='e.g. S, XL, MD'
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               );
//             }}
//           />

//           <FormField
//             control={control}
//             name={`variants.${index}.color`}
//             render={({ field }) => {
//               const { value, ...rest } = field;
//               return (
//                 <FormItem className='w-1/2'>
//                   <FormLabel>Variant Color</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...rest}
//                       value={value ?? ''}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               );
//             }}
//           />
//           <FormField
//             control={control}
//             name={`variants.${index}.price`}
//             render={({ field }) => (
//               <FormItem className='w-1/2'>
//                 <FormLabel>Variant Price</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className='flex gap-4 my-10'>
//           <UploadProductImagWidget
//             onUpload={uploadedUrls => {
//               const newImages = [...variantImages, ...uploadedUrls];
//               setValue(`variants.${index}.images`, newImages, { shouldValidate: true });
//             }}
//             isVariant={true}
//             isPending={isPending}
//           />

//           <Button
//             type='button'
//             className='cursor-pointer'
//             variant='destructive'
//             onClick={() => remove(index)}>
//             <TrashIcon className='w-4 h-4 mr-1' /> Remove
//           </Button>
//         </div>
//       </div>
//     );
//   })}

//   <Button
//     type='button'
//     onClick={() => append({ size: '', price: 0, images: [], color: '' })}
//     className='flex items-center gap-2 mt-4'>
//     <PlusIcon className='w-4 h-4' /> Add Variant
//   </Button>
// </div>
