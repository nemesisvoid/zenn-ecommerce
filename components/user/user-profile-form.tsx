'use client';

import * as z from 'zod';
import { updateUser } from '@/actions/user.action';
import { useTransition, useRef, useState } from 'react';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    console.log('file', file);
    const reader = new FileReader();
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onSubmit = async (data: z.infer<typeof UserProfileSettingsSchema>) => {
    console.log('form data', data);

    startTransition(async () => {
      try {
        if (file) {
          console.log('working---------2');
          console.log('file in form', file);
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
          console.log('result here', result);

          if (!result) throw new Error('Error uploading images to cloudinary');
          data.avatar = result.secure_url as string;
        }

        console.log('form data 2', data.avatar);
        console.log('form data 3', data);
        const res = await updateUser(initialData.id, data);
        if (res?.success) {
          toast.success(res?.message);
        } else {
          toast.error(res?.message || 'Failed to update profile');
        }
      } catch (error) {
        toast.error('Something went wrong');
        console.log(error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, err => console.log('form err', err))}>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium'>Profile</h3>
            <p className='text-sm text-muted-foreground'>This is how others will see you on the site.</p>
          </div>
          <Separator />

          {/* Avatar Section */}
          <div className='flex items-center gap-x-4'>
            <Avatar className='w-20 h-20'>
              <AvatarImage
                src={avatarPreview}
                className='object-cover'
              />
              <AvatarFallback>{`${initialData.firstName[0]}${initialData.lastName[0]}s`}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium'>Change Avatar</p>
              <Button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                variant='outline'>
                Upload Image
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
          <div className='grid gap-4 py-4 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        {...field}
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className='text-[0.8rem] text-muted-foreground'>Email cannot be changed via profile settings. Contact support.</p>
            </div>

            <div>
              <FormField
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Address</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>{' '}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end mt-4'>
              <Button
                type='submit'
                disabled={isPending}>
                {isPending ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileForm;
