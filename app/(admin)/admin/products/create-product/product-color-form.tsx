import * as z from 'zod';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { CreateProductSchema } from '@/schemas';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import UploadProductImagWidget from '@/components/cloudinary/upload-image-widget';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductColorFormProps {
  form: UseFormReturn<z.infer<typeof CreateProductSchema>>;
  isPending: boolean;
}
const ProductColorForm = ({ form, isPending }: ProductColorFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'colorImages',
  });
  return (
    <div className='space-y-5'>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className='flex gap-4 p-4 border rounded-md'>
          <FormField
            control={form.control}
            name={`colorImages.${index}.color`}
            render={({ field }) => (
              <FormItem className='w-1/3'>
                <FormLabel>Color Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='e.g., Midnight Black'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`colorImages.${index}.images`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images for {form.watch(`colorImages.${index}.color`) || 'this color'}</FormLabel>

                <FormControl>
                  <UploadProductImagWidget
                    isPending={isPending}
                    isVariant={true}
                    // Note: You'll need to manage the 'field.value' (which is an array)
                    // and use 'field.onChange' to update it.
                    // This is slightly different from your current uploader logic.
                    // You'd pass field.value as the list of current images
                    // and call field.onChange([...field.value, ...uploadedUrls])
                    onUpload={uploadedUrls => {
                      const currentImages = field.value || [];
                      field.onChange([...currentImages, ...uploadedUrls]);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant='destructive'
            onClick={() => remove(index)}>
            <TrashIcon />
          </Button>
        </div>
      ))}
      <Button onClick={() => append({ color: '', images: [] })}>Add Color</Button>
    </div>
  );
};

export default ProductColorForm;
