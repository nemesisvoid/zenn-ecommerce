'use client';

import { useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ImageIcon, Loader2Icon } from 'lucide-react';

import { createBanner, updateBanner } from '@/actions/banner.actions';
import { BannerFieldsSchema } from '@/schemas';
import { handleImageUpload } from '@/helper/utils';
import ImageUploader from '@/components/misc/image-uploader';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

// The form holds the image as a File (new upload) or URL (existing), and dates as
// <input type="datetime-local"> strings; both are converted on submit.
const BannerFormSchema = BannerFieldsSchema.omit({ imageUrl: true, sortOrder: true, startsAt: true, endsAt: true })
  .extend({
    image: z
      .union([z.instanceof(File), z.string()])
      .nullable()
      .refine(value => !!value, 'Add a banner image'),
    sortOrder: z.number({ invalid_type_error: 'Enter a number' }).int().min(0, 'Order must be 0 or more'),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
  })
  .refine(data => !data.startsAt || !data.endsAt || new Date(data.endsAt) > new Date(data.startsAt), {
    path: ['endsAt'],
    message: 'End date must be after the start date',
  });

type BannerFormValues = z.infer<typeof BannerFormSchema>;

export type BannerFormInitialData = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  href: string;
  ctaLabel: string;
  isActive: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
};

/** Date -> value for <input type="datetime-local"> in the admin's local time. */
const toLocalInput = (date: Date | null) => {
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const sectionClass = 'admin-card rounded-xl border border-border';
const sectionTitle = 'border-b border-border px-5 py-4 text-sm font-semibold text-foreground';

const BannerForm = ({ initialData, nextSortOrder = 0 }: { initialData?: BannerFormInitialData; nextSortOrder?: number }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      subtitle: initialData?.subtitle ?? '',
      image: initialData?.imageUrl ?? null,
      href: initialData?.href ?? '/list',
      ctaLabel: initialData?.ctaLabel ?? 'Shop now',
      isActive: initialData?.isActive ?? true,
      sortOrder: initialData?.sortOrder ?? nextSortOrder,
      startsAt: toLocalInput(initialData?.startsAt ?? null),
      endsAt: toLocalInput(initialData?.endsAt ?? null),
    },
  });

  const [title, subtitle, image, ctaLabel] = form.watch(['title', 'subtitle', 'image', 'ctaLabel']);

  // Object URL for previewing a newly chosen file; revoked when it changes.
  const previewSrc = useMemo(() => (image instanceof File ? URL.createObjectURL(image) : image || null), [image]);
  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith('blob:')) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  const onSubmit = (values: BannerFormValues) => {
    startTransition(async () => {
      try {
        const [imageUrl] = await handleImageUpload(values.image ? [values.image] : [], 'category-images', 'ecommerce-banner-images');
        if (!imageUrl) {
          toast.error('Image upload failed. Please try again.');
          return;
        }

        const payload = {
          title: values.title,
          subtitle: values.subtitle,
          imageUrl,
          href: values.href,
          ctaLabel: values.ctaLabel,
          isActive: values.isActive,
          sortOrder: values.sortOrder,
          startsAt: values.startsAt ? new Date(values.startsAt) : null,
          endsAt: values.endsAt ? new Date(values.endsAt) : null,
        };

        const res = initialData ? await updateBanner(initialData.id, payload) : await createBanner(payload);
        if (!res.success) {
          toast.error(res.message);
          return;
        }
        toast.success(res.message);
        router.push('/admin/banners');
        router.refresh();
      } catch (error) {
        console.error('banner save failed', error);
        toast.error('Something went wrong saving the banner');
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='space-y-6'>
          <section className={sectionClass}>
            <h2 className={sectionTitle}>Content</h2>
            <div className='grid gap-5 p-5'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Weekend sale: 30% off sneakers'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='subtitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting text (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder='One or two short sentences under the headline.'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-5 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='href'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='/list?category=shoes'
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>A store path like /list, or a full https:// link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='ctaLabel'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button text</FormLabel>
                      <FormControl>
                        <Input
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
          </section>

          <section className={sectionClass}>
            <h2 className={sectionTitle}>Image</h2>
            <div className='p-5'>
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='max-w-xs'>
                        <ImageUploader
                          value={field.value}
                          onChange={value => field.onChange(Array.isArray(value) ? (value[0] ?? null) : value)}
                          uploadMultiple={false}
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Use a wide, high-quality photo (at least 1600 × 1000 px). It is cropped to fit.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        </div>

        <aside className='space-y-6 lg:sticky lg:top-6 lg:self-start'>
          <section className={sectionClass}>
            <h2 className={sectionTitle}>Preview</h2>
            <div className='p-5'>
              <div className='relative aspect-[16/10] overflow-hidden rounded-lg bg-muted'>
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt=''
                    fill
                    sizes='360px'
                    className='object-cover'
                    unoptimized={previewSrc.startsWith('blob:')}
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-muted-foreground'>
                    <ImageIcon
                      className='size-8'
                      aria-hidden='true'
                    />
                  </div>
                )}
              </div>
              <p className='mt-4 font-display text-2xl leading-tight tracking-tight text-foreground'>{title || 'Your headline'}</p>
              {subtitle && <p className='mt-2 text-sm text-muted-foreground'>{subtitle}</p>}
              <span className='mt-4 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-semibold text-background'>
                {ctaLabel || 'Shop now'}
              </span>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className={sectionTitle}>Visibility</h2>
            <div className='grid gap-5 p-5'>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between gap-4'>
                    <div>
                      <FormLabel>Live on homepage</FormLabel>
                      <FormDescription>Hidden banners are kept but not shown.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        value={Number.isNaN(field.value) ? '' : field.value}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>Lower numbers show first.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='startsAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start showing (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endsAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop showing (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>Leave empty to show until you hide it.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <div className='flex gap-3'>
            <Button
              type='submit'
              disabled={isPending}
              className='flex-1'>
              {isPending && (
                <Loader2Icon
                  className='size-4 animate-spin'
                  aria-hidden='true'
                />
              )}
              {initialData ? 'Save changes' : 'Create banner'}
            </Button>
            <Button
              type='button'
              variant='outline'
              asChild>
              <Link href='/admin/banners'>Cancel</Link>
            </Button>
          </div>
        </aside>
      </form>
    </Form>
  );
};

export default BannerForm;
