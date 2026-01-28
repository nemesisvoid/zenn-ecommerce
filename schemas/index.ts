import { PaymentMethods } from '@/constants';
import { AccountStatus, UserRole } from '@prisma/client';
import * as z from 'zod';

// Allow image entries to be either a URL string or a browser `File` object.
// On the server (Node) `File` may be undefined, so fall back to `z.any()`.
const FileTypeSchema = typeof File !== 'undefined' ? z.instanceof(File) : z.any();

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const RegisterSchema = z.object({
  firstName: z.string().min(3, { message: 'First name must be at least 3 characters' }),
  lastName: z.string().min(3, { message: 'Last name must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters' }),
});

export const CartItemsSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().nonnegative('Quantity must be a positive number'),
  price: z.number().nonnegative('Price must be a positive number'),
  variantId: z.string().optional().nullable(),
});

export const CartSchema = z.object({
  id: z.string().optional(),
  sessionCartId: z.string(),
  cartItems: z.array(CartItemsSchema),
  userId: z.string().optional().nullable(),
  itemsPrice: z.number().nonnegative('Items price must be a positive number'),
  shippingPrice: z.number().nonnegative('Shipping price must be a positive number'),
  totalPrice: z.number().nonnegative('Total price must be a positive number'),
});

export const OrderSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  phone: z.string().min(11, { message: 'Phone number must be at least 11 characters' }).optional(),
  address: z.string().min(3, { message: 'Address must be at least 3 characters' }),
  city: z.string().min(3, { message: 'City must be at least 3 characters' }),
  country: z.string().min(3, { message: 'Country must be at least 3 characters' }),
  postalCode: z.string().min(3, { message: 'Postal code must be at least 3 characters' }),
  paymentMethod: z.string().refine(data => PaymentMethods.includes(data), { path: ['paymentMethod'], message: 'Invalid payment method' }),
});

export const OrderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  slug: z.string(),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  quantity: z.number().int().nonnegative('Quantity must be a positive number'),
  price: z.number().nonnegative('Price must be a positive number'),
  image: z.string(),
  color: z.string().min(3, { message: 'Color must be at least 3 characters' }).optional().nullable(),
  size: z.string().min(3, { message: 'Size must be at least 3 characters' }).optional().nullable(),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }).optional().nullable(),
});

export const CreateProductVariantSchema = z.object({
  size: z.string().min(1, { message: 'Size is required' }).optional().nullable(),
  color: z.string().min(3, { message: 'Color must be at least 3 characters' }).optional().nullable(),
  price: z.coerce.number().nonnegative('Price must be a positive number'),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }).optional().nullable(),
  stock: z.coerce.number().min(0).optional(),
});

export const CreateProductColorImageSchema = z.object({
  color: z.string().min(1, 'Color name is required'),
  images: z.array(z.union([z.string().url(), FileTypeSchema])).min(1, 'At least one image is required for the color'),
});

export const CreateProductSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  price: z.coerce.number().nonnegative('Price must be a positive number'),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  categories: z.array(z.string()).optional(),
  images: z.array(z.union([z.string().url(), FileTypeSchema])).min(1, { message: 'At least one image is required' }),
  stock: z.coerce.number().nonnegative('Stock must be a positive number'),
  discountPercent: z.coerce.number().nonnegative('Discount percent must be a positive number').optional(),
  colorImages: z.array(CreateProductColorImageSchema).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(CreateProductVariantSchema).optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(3, { message: 'Category name must be at least 3 characters' }),
  description: z.string().min(3, { message: 'Category description must be at least 3 characters' }).optional(),
  coverImage: z.string().url().min(1, { message: 'Category cover image must have a cover image' }),
  products: z.array(z.object({ id: z.string(), name: z.string(), image: z.string().optional() })).optional(),
});

export const GeneralSettingsSchema = z.object({
  storeName: z.string().min(3, { message: 'Store name must be at least 3 characters' }),
  storeEmail: z.string().email({ message: 'Enter a valid email' }),
  storePhone: z.string().min(7, { message: 'Store phone must be at least 7 characters' }),
  storeAddress: z.string().min(10, { message: 'Store address must be at least 10 characters' }).optional().or(z.literal('')),
  // storeCity: z.string().min(3, { message: 'Store city must be at least 3 characters' }).optional(),
  // storeCountry: z.string().min(3, { message: 'Store country must be at least 3 characters' }).optional(),
  // storePostalCode: z.string().min(3, { message: 'Store postal code must be at least 3 characters' }).optional(),
  // storeDescription: z.string().min(3, { message: 'Store description must be at least 3 characters' }).optional(),
  // storeCoverImage: z.string().url().min(1, { message: 'Store cover image must have a cover image' }).optional(),
});

export const ShippingSettingsSchema = z.object({
  shippingFee: z.coerce.number().nonnegative('Default shipping cost must be a positive number'),
  freeShippingThreshold: z.coerce.number().nonnegative('Free shipping threshold must be a positive number'),
  taxRate: z.coerce.number().nonnegative('Tax rate must be a positive number').optional(),
  // paymentMethod: z.array(
  //   z.object({
  //     paystack: z.boolean().default(false),
  //     payOnDelivery: z.boolean().default(false),
  //   })
  // ),

  // shippingMethods: z.array(
  //   z.object({
  //     name: z.string().min(3, { message: 'Shipping method name must be at least 3 characters' }),
  //     price: z.coerce.number().nonnegative('Shipping method price must be a positive number'),
  //   }),
  // ),
});

export const SystemSettingsSchema = z.object({
  currency: z.string().min(1, { message: 'Currency is required' }),
  timezone: z.string().min(1, { message: 'Timezone is required' }),
  dateFormat: z.string().min(1, { message: 'Date format is required' }),
  timeFormat: z.string().min(1, { message: 'Time format is required' }),
  maintenanceMode: z.boolean().default(false),
  enableReviews: z.boolean().default(true),
});

export const SettingsSchema = GeneralSettingsSchema.partial().merge(ShippingSettingsSchema.partial()).merge(SystemSettingsSchema.partial());

export const AdminUserSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }).nullish(),
  email: z.string().email({ message: 'Enter a valid email' }).optional(),
  address: z.string().min(3, { message: 'Address must be at least 3 characters' }).nullish(),
  phone: z.string().min(11, { message: 'Phone number must be at least 11 characters' }).nullish(),
});

export const AdminUserAccountManagementSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isEmailVerified: z.boolean().default(false).optional(),
  userStatus: z.nativeEnum(AccountStatus).optional(),
  resetPasswordLink: z.string().url().optional(),
  adminNotes: z.string().min(3, { message: 'Admin notes must be at least 3 characters' }).optional(),
});

export const AdminUserSettingsSchema = AdminUserSchema.partial()
  .merge(AdminUserAccountManagementSchema.partial())
  .refine(
    data => {
      return data.userStatus === 'BANNED' || data.userStatus === 'SUSPENDED' ? !!data.adminNotes : true;
    },
    {
      path: ['adminNotes'],
      message: 'Admin notes are required when suspending or banning a user',
    },
  );
