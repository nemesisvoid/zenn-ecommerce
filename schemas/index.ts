import { PaymentMethods } from '@/constants';
import * as z from 'zod';

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
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }).optional(),
  stock: z.number().min(0),
});

export const CreateProductColorImageSchema = z.object({
  color: z.string().min(1, 'Color name is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required for the color'),
});

export const CreateProductSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters' }),
  price: z.coerce.number().nonnegative('Price must be a positive number'),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  categories: z.array(z.string()).min(1, { message: 'Category is required' }),
  images: z.array(z.string()).min(1, { message: 'At least one image is required' }),
  stock: z.coerce.number().nonnegative('Stock must be a positive number'),
  discountPercent: z.coerce.number().nonnegative('Discount percent must be a positive number').optional(),
  colorImages: z.array(CreateProductColorImageSchema).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(CreateProductVariantSchema).optional(),
});
