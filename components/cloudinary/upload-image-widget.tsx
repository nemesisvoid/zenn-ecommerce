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
        const info = result?.info;
        if (!info) return;

        let urls: string[] = [];

        // Case 1: 'info' is the object containing secure_url directly (Single upload)
        if (typeof info === 'object' && 'secure_url' in info) {
          urls = [(info as any).secure_url];
        }
        // Case 2: We are relying on internal behavior, but standard check:
        else if (Array.isArray(info)) {
          urls = info.map((file: any) => file.secure_url);
        }

        onUpload(urls);
      }}>
      {({ open }) => {
        return (
          <Button
            className='button text-sm rounded-sm py-5 cursor-pointer w-1/2'
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
