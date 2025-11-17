'use client';

import { Loader2Icon } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '../ui/button';

interface UploadProductImagWidgetProps {
  onUpload: (urls: string[]) => void;
  isVariant: boolean;
  isPending: boolean;
}

const UploadProductImagWidget = ({ onUpload, isVariant, isPending }: UploadProductImagWidgetProps) => {
  const uploadPreset = isVariant ? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_VARIANTS : process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        multiple: true,
        clientAllowedFormats: ['jpg', 'png', 'jpeg'],
      }}
      onSuccess={result => {
        const uploadedUrls = Array.isArray(result.info) ? result.info.map(file => file.secure_url) : [result.info?.secure_url];
        onUpload(uploadedUrls);
      }}>
      {({ open }) => {
        return (
          <Button
            className='button text-sm rounded-sm py-5 cursor-pointer'
            onClick={() => open()}
            disabled={isPending}>
            {isVariant ? 'Upload Variant Images' : 'Upload Product Images'}
            {isPending && <Loader2Icon className='w-4 h-4 animate-spin' />}
          </Button>
        );
      }}
    </CldUploadWidget>
  );
};
export default UploadProductImagWidget;
