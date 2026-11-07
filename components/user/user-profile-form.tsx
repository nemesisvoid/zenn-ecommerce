'use client';

import * as z from 'zod';
import { updateUser } from '@/actions/user.action';
import { useTransition, useRef, useState } from 'react';

import { storeInput, storeLabel, storePrimaryButton } from '@/components/shared/form-styles';
import SettingsHeader from './settings-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserProfileSettingsSchema } from '@/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { toast } from 'sonner';

interface UserProfileFormProps {
  initialData: {
    id: string;
    avatar: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
  };
}

const UserProfileForm = ({ initialData }: UserProfileFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(initialData.avatar || '/placeholder-user.jpg');
  const form = useForm<z.infer<typeof UserProfileSettingsSchema>>({
    resolver: zodResolver(UserProfileSettingsSchema),
    defaultValues: initialData
      ? {
          avatar: initialData.avatar || '',
          email: initialData.email || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          address: initialData.address || '',
          city: initialData.city || '',
          country: initialData.country || '',
        }
      : {
          avatar: '',
          email: '',
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: '',
        },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onSubmit = async (data: z.infer<typeof UserProfileSettingsSchema>) => {

    startTransition(async () => {
      try {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'user-avatar');
          formData.append('folder', 'users');

          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
          });

          const result = await res.json();
          if (!res.ok) {
            throw new Error(result.error?.message || 'Upload failed');
          }

          if (!result) throw new Error('Error uploading images to cloudinary');
          data.avatar = result.secure_url as string;
        }

        const res = await updateUser(initialData.id, data);
        if (res?.success) {
          toast.success(res?.message);
        } else {
          toast.error(res?.message || 'Failed to update profile');
        }
      } catch (error) {
        toast.error('Something went wrong');
        console.error(error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <SettingsHeader
            title='Profile'
            description='Your name, photo and default delivery details.'
          />

          <div className='panel'>
          {/* Avatar Section */}
          <div className='flex items-center gap-5 border-b border-border p-6 md:p-8'>
            <Avatar className='size-20 ring-1 ring-border'>
              <AvatarImage
                src={avatarPreview}
                className='object-cover'
              />
              <AvatarFallback className='bg-secondary text-lg font-medium'>{getInitials(initialData)}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col items-start gap-2'>
              <p className='text-sm font-medium text-foreground'>Profile photo</p>
              <Button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                variant='outline'
                className='h-9 cursor-pointer rounded-full px-4'>
                Upload image
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
            </div>
          </div>

          {/* Form Section */}
          <div className='grid gap-5 p-6 md:p-8'>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <FormField
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>First name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='given-name'
                        className={storeInput}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>Last name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='family-name'
                        className={storeInput}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-2'>
              <FormField
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className={storeInput}
                        {...field}
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className='text-[0.8125rem] text-muted-foreground'>Your email can&apos;t be changed here. Contact support to update it.</p>
            </div>

            <div>
              <FormField
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>Delivery address</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='street-address'
                        className={storeInput}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <FormField
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>Country</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='country-name'
                        className={storeInput}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={storeLabel}>City</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        autoComplete='address-level2'
                        className={storeInput}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className='flex justify-end border-t border-border px-6 py-4 md:px-8'>
            <Button
              type='submit'
              className={storePrimaryButton}
              disabled={isPending}>
              {isPending ? 'Saving changes…' : 'Save changes'}
            </Button>
          </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileForm;
