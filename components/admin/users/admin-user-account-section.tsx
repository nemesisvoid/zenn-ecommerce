import * as z from 'zod';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { AdminUserAccountManagementSchema } from '@/schemas';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon, KeyIcon, MailIcon, ShieldIcon, StickyNoteIcon, UserIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
const AdminUserAccountSection = ({ form }: { form: UseFormReturn<z.infer<typeof AdminUserAccountManagementSchema>> }) => {
  const isEmailVerified = form.watch('isEmailVerified');
  const currentStatus = form.watch('userStatus');
  const [isBanAlertOpen, setIsBanAlertOpen] = useState(false);
  console.log('current status:', currentStatus);

  const handleUserStatus = (value: z.nativeEnum<typeof AdminUserAccountManagementSchema.shape.userStatus>) => {
    if (value === 'BANNED') {
      setIsBanAlertOpen(true);
    } else {
      form.setValue('userStatus', value);
    }
  };

  const confirmBan = () => {
    form.setValue('userStatus', 'BANNED', { shouldDirty: true, shouldTouch: true });
    setIsBanAlertOpen(false);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-gray-600 bg-card shadow-sm overflow-hidden mb-10 dark:bg-dark-100',
        ['BANNED', 'SUSPENDED'].includes(currentStatus as string) ? '!border-red-400' : '',
      )}>
      {/* Section Header */}
      <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center'>
        <div>
          <h2 className='text-base font-semibold'>User Account Management</h2>
          <p className='text-xs text-muted-foreground'>Control permissions, status, and security settings.</p>
        </div>
        <Badge variant={currentStatus === 'ACTIVE' ? 'default' : 'destructive'}>{currentStatus}</Badge>
      </div>

      <div className='p-6 space-y-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* User Role Select */}
          <FormField
            name='role'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <ShieldIcon className='w-4 h-4' /> User Role
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='USER'>
                      <div className='flex items-center gap-2'>
                        <UserIcon className='w-4 h-4' /> Standard User
                      </div>
                    </SelectItem>
                    <SelectItem value='ADMIN'>
                      <div className='flex items-center gap-2 text-primary font-medium'>
                        <ShieldIcon className='w-4 h-4' /> Administrator
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* User Status Select */}
          <FormField
            name='userStatus'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <AlertTriangleIcon className='w-4 h-4' /> Account Status
                </FormLabel>
                <Select
                  onValueChange={handleUserStatus}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger className={field.value === 'BANNED' ? 'border-destructive text-destructive' : ''}>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='SUSPENDED'>Suspended</SelectItem>
                    <SelectItem
                      value='BANNED'
                      className='text-destructive font-bold'>
                      BANNED
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Email Verification Toggle */}
          <FormField
            name='isEmailVerified'
            control={form.control}
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 col-span-1 md:col-span-2 bg-muted/30'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-sm font-semibold flex items-center gap-2'>
                    <MailIcon className='w-4 h-4' /> Email Verification Status
                  </FormLabel>
                  <FormDescription>
                    {isEmailVerified ? 'This user has a verified email.' : 'User cannot perform certain actions until verified.'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Internal Notes / Reason */}
          <FormField
            name='adminNotes'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-1 md:col-span-2'>
                <FormLabel className='flex items-center gap-2'>
                  <StickyNoteIcon className='w-4 h-4' /> Admin Internal Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Add notes about this user (e.g. why they were promoted or warned)...'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Footer */}
        <div className='pt-4 border-t flex flex-wrap gap-4 items-center justify-between'>
          <div className='space-y-1'>
            <h4 className='text-sm font-medium'>Security Actions</h4>
            <p className='text-xs text-muted-foreground'>Trigger manual security overrides for this account.</p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50'
            onClick={() => {
              /* Add your reset logic here */
            }}>
            <KeyIcon className='w-4 h-4' /> Send Password Reset Email
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Banning */}
      <AlertDialog
        open={isBanAlertOpen}
        onOpenChange={setIsBanAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Banning this user will immediately revoke their access to the platform. You can reverse this later, but the user will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBan}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Confirm Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserAccountSection;
