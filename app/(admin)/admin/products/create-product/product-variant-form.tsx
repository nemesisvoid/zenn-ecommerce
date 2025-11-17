import { useState } from 'react';

import * as z from 'zod';
import { getVariantCombinations } from '@/helper/utils';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { CreateProductSchema } from '@/schemas';
import { Input } from '@/components/ui/input';
import TagInput from '@/components/ui/tag-input';

import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { FormField } from '@/components/ui/form';
import ProductColorForm from './product-color-form';

interface ProductVariantFormProps {
  form: UseFormReturn<z.infer<typeof CreateProductSchema>>;
  isPending: boolean;
}
const ProductVariantForm = ({ form, isPending }: ProductVariantFormProps) => {
  const [options, setOptions] = useState<{ id: number; name: string; values: string[] }[]>([
    { id: 1, name: 'Color', values: [] },
    { id: 2, name: 'Size', values: [] },
  ]);

  const { control, setValue } = form;
  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'variants',
  });

  const handleOptionChange = (optionId: number, newValues: string[]): void => {
    setOptions(currentOptions => currentOptions.map(opt => (opt.id === optionId ? { ...opt, values: newValues } : opt)));
  };

  // Helper to update a specific option's name
  const setOptionName = (optionId: number, newName: string): void => {
    setOptions(currentOptions => currentOptions.map(opt => (opt.id === optionId ? { ...opt, name: newName } : opt)));
  };

  const handleGenerateVariants = () => {
    const allValues = options.map(option => option.values);

    const combinations = getVariantCombinations(allValues);

    const newVariants = combinations.map(combo => ({
      color: combo[0],
      size: combo[1],
      price: 0,
      stock: 0,
      sku: '',
    }));

    replace(newVariants);
    console.log('new Var:', newVariants);
  };
  console.log('fields', fields);
  return (
    <div>
      <ProductColorForm
        form={form}
        isPending={isPending}
      />
      <div className='space-y-4'>
        {options.map(opt => (
          <div
            key={opt.id}
            className='flex items-end gap-2'>
            {/* 2. TagInput for Option Values */}
            <div className='flex-[2]'>
              <label className='text-sm font-medium'>Option Values</label>
              <TagInput
                value={opt.values}
                onChange={newValues => handleOptionChange(opt.id, newValues)}
                placeholder='Type values and press Enter...'
              />
            </div>

            <Button
              type='button'
              variant='destructive'
              // onClick={() => removeOption(opt.id)}
            >
              <TrashIcon className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type='button'
        // onClick={addOption}
        className='mt-4'>
        Add another option
      </Button>

      <hr className='my-6' />

      {/* Your "Generate Variants" button */}
      <Button
        type='button'
        onClick={handleGenerateVariants}
        className='mb-6'>
        Generate Variants
      </Button>

      {fields.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th>Size</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              return (
                <tr key={field.id}>
                  <td>
                    {/* We just display the generated value */}
                    {form.watch(`variants.${index}.color`)}
                  </td>
                  <td>{form.watch(`variants.${index}.size`)}</td>
                  <td>
                    {/* Price is an input */}
                    <FormField
                      control={control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type='number'
                        />
                      )}
                    />
                  </td>
                  <td>
                    <Button
                      variant='destructive'
                      onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
