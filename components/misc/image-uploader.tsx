import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PlusIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  value: File | string | (File | string)[] | null | undefined;
  onChange: (value: File | string | (File | string)[] | null) => void;
  disabled?: boolean;
  uploadMultiple: boolean;
}

const ImageUploader = ({ value = [], onChange, disabled, uploadMultiple }: ImageUploaderProps) => {
  const valueAsArray = Array.isArray(value) ? value : value ? [value] : [];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      if (uploadMultiple) {
        onChange([...valueAsArray, ...newFiles]);
      } else {
        onChange(newFiles[0]);
      }
    }
  };

  console.log('init', value);

  const handleRemoveImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadMultiple) {
      const updated = valueAsArray.filter((img, i) => i !== indexToRemove);
      onChange(updated);
    } else {
      onChange(null);
    }
  };
  const shouldShowUploadBtn = uploadMultiple || valueAsArray.length === 0;

  return (
    <div className='space-y-4'>
      {/* Container that acts as both List and Uploader */}
      <div className='grid grid-cols-3 gap-4'>
        {/* 1. RENDER EXISTING IMAGES */}
        {valueAsArray.map((item, index) => {
          const isFile = item instanceof File;
          const imageUrl = isFile ? URL.createObjectURL(item) : (item as string);

          return (
            <div
              key={index}
              className='relative aspect-square rounded-lg overflow-hidden border border-gray-200 group'>
              <Image
                fill
                src={imageUrl}
                alt='Preview'
                className='object-cover'
              />
              {/* Remove Button */}
              <button
                onClick={e => handleRemoveImage(index, e)}
                className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20'
                type='button'>
                <XIcon size={14} />
              </button>
            </div>
          );
        })}

        {shouldShowUploadBtn && (
          <div
            className={cn(
              'relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 transition flex flex-col items-center justify-center cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed',
            )}>
            <Input
              type='file'
              accept='image/*'
              multiple={uploadMultiple}
              disabled={disabled}
              onChange={handleFileChange}
              className='absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer'
              // value must be empty string to allow selecting same file twice if needed
              value=''
            />

            <div className='flex flex-col items-center justify-center text-xs text-gray-500'>
              {uploadMultiple && valueAsArray.length > 0 ? (
                <>
                  <PlusIcon
                    size={24}
                    className='mb-1'
                  />
                  <span>Add More</span>
                </>
              ) : (
                <>
                  <UploadCloudIcon
                    size={32}
                    className='mb-2 text-gray-400'
                  />
                  <span className='font-semibold text-center px-2'>{uploadMultiple ? 'Upload Images' : 'Upload Image'}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
