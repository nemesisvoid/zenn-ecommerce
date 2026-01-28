'use client';

import * as z from 'zod';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { editUser } from '@/actions/user.action';

import AdminUserProfileSection from '@/components/admin/users/admin-user-profile-section';
import AdminUserAccountSection from '@/components/admin/users/admin-user-account-section';

import { AdminUserSettingsSchema } from '@/schemas';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';

interface AdminUserFormProps {
  id: string;
  initialData: z.infer<typeof AdminUserSettingsSchema>;
}
const AdminUserForm = ({ id, initialData }: AdminUserFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof AdminUserSettingsSchema>>({
    resolver: zodResolver(AdminUserSettingsSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          email: '',
          name: '',
          address: '',
          role: 'USER' as const,
          phone: '',
          isEmailVerified: false,
          userStatus: 'ACTIVE' as const,
          adminNotes: '',
        },
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: z.infer<typeof AdminUserSettingsSchema>) => {
    try {
      if (initialData) {
        startTransition(async () => {
          const res = await editUser(id, data);
          if (res?.success) {
            toast.success(res?.message);
            router.refresh();
          } else {
            toast.error(res?.message);
          }
        });
      }
    } catch (error) {
      console.log('error editing user', error);
    }
  };
  return (
    <Form {...form}>
      <form
        action=''
        onSubmit={handleSubmit(onSubmit)}>
        <div>
          <AdminUserProfileSection form={form} />
          <AdminUserAccountSection form={form} />
          <Button disabled={isPending}>
            {isPending && <LoaderIcon className='ml-2 h-4 w-4 animate-spin' />}
            {isPending ? 'Updating' : 'Update User'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminUserForm;
