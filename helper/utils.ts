// import isEqual from 'lodash';
import { CartItemType } from '@/types';
import { CartItem } from '@prisma/client';
import { isEqual } from 'lodash';

// l.isEqual = require('lodash.isequal');

interface CalcPriceProps {
  price: number;
  quantity: number;
}

export const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export const formatCurrency = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-US').format(`${amount}`);
  return `₦${formatter}`;
};

export const getPercentagePrice = (amount: number, percentage: number | null) => {
  if (!percentage || percentage === 0) return amount;
  return amount - (percentage / 100) * amount;
};

export const calcPrice = (arr: CalcPriceProps[]) => {
  const newArr = arr.map(item => ({
    price: item.price,
    quantity: item.quantity,
  }));
  console.log('newArr', newArr);
  const itemsPrice = newArr.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500000 ? 0 : 1000;
  const totalPrice = itemsPrice + shippingPrice;
  return { itemsPrice, shippingPrice, totalPrice };
};

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

/**
 * Calculates the Cartesian product of multiple arrays.
 * @param {Array<Array<any>>} arrays - An array of arrays, e.g., [['Red', 'Green'], ['S', 'M']]
 * @returns {Array<Array<any>>} All possible combinations, e.g., [['Red', 'S'], ['Red', 'M'], ['Green', 'S'], ['Green', 'M']]
 */
export const getVariantCombinations = <T>(arrays: T[][]): T[][] => {
  if (!arrays || arrays.length === 0) return [];

  return arrays.reduce<T[][]>(
    (acc, currentArray) => {
      return acc.flatMap(accValue => {
        return currentArray.map(currentValue => [...accValue, currentValue]);
      });
    },
    [[] as T[]],
  );
};

// const cartesian = arrays => {
//   return arrays.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
// };

export const uniqueArray = (arr: any[], attr: string) => {
  const unique = Array.from(new Set(arr.map(item => item[attr])));
  return unique;
};

export const handleImageUpload = async (images: (File | string)[], uploadPresetName: string, uploadPresetFolderName: string) => {
  const imagesToUpload = images.filter((img: File | string) => img instanceof File);

  const imageUrls = images.filter((img): img is string => typeof img === 'string');

  const uploadPromiseImage = imagesToUpload.map(async file => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPresetName);
    formData.append('folder', uploadPresetFolderName);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!result) throw new Error('Error uploading images to cloudinary');
    return result.secure_url as string;
  });

  const uploadedImages = await Promise.all(uploadPromiseImage);
  return [...imageUrls, ...uploadedImages];
};

export const compareData = (oldData: any, newData: any) => {
  const changes: Record<string, { old: any; new: any }> = {};
  const ignoredKeys = ['updatedAt', 'createdAt', 'images', 'id', 'userId'];

  Object.keys(newData).forEach(key => {
    if (ignoredKeys.includes(key)) return;

    if (!Object.prototype.hasOwnProperty.call(oldData, key)) return;

    const oldValue = oldData[key];
    const newValue = newData[key];

    if (newValue === undefined || newValue === null) return;
    if (newValue === '' && oldValue == null) return;

    if (isEqual(oldValue, newValue)) return;

    changes[key] = {
      old: oldValue,
      new: newValue,
    };
    console.log('OLD:', oldData);
    console.log('NEW:', newData);
  });

  return Object.keys(changes).length > 0 ? changes : null;
};

export const getProductVariants = (product: any[]) => {
  variants.map(variant => variant.name);
  if (product.variants && product.variants.length > 0) {
    return {};
  } else {
    return {};
  }
};

export const renderProduct = (product: CartItemType[]) => {
  return product?.map(item => {
    console.log(typeof item.variants);
    console.log(item);

    if (item.variants || item.hasVariants) {
      console.log('item.variants', item.variants);
      const colorImage = item.products?.colorImages;
      const variantColors = item.variants.color;
      const foundVariant = colorImage?.find(color => color.color === variantColors && color.productId === item.products?.id);
      if (foundVariant)
        return {
          productId: foundVariant.productId,
          color: foundVariant.color,
          size: item.variants.size,
          images: foundVariant.images,
          price: item.variants.price,
          name: item.products?.name,
          variantId: item.variants.id,
          quantity: item.quantity,
        };
    } else {
      return {
        productId: item.products?.id,
        name: item.products?.name,
        images: item.products?.images,
        price: item.price,
        quantity: item.quantity,
      };
    }
  });
};

export const receiptEmailHtml = (order: any) => {
  const itemsRows = order.orderItems
    .map(
      (item: any) => `
    <tr>
      <td style="padding:8px 0;">
        <strong>${item.product.name}</strong>
        ${item.variant ? `<br/><small>Variant Color: ${item.variant.color}</small> <br/> <small>Variant Size: ${item.variant.size}</small>` : 'N/A'}
      </td>
      <td align="center">${item.quantity}</td>
      <td align="right">₦${item.price.toLocaleString()}</td>
      <td align="right">₦${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `,
    )
    .join('');

  return `
  <div style="font-family: Arial, sans-serif; background:#f6f9fc; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#111827; color:white; padding:20px;">
        <h2 style="margin:0;">🎉 Payment Successful</h2>
        <p style="margin:5px 0 0;">Thank you for your order!</p>
      </div>

      <!-- Order Info -->
      <div style="padding:20px; font-size:14px; color:#333;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Payment Date:</strong> ${new Date(order.paidAt).toDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <!-- Receipt Table -->
      <div style="padding:0 20px 20px;">
        <h3 style="border-bottom:1px solid #eee; padding-bottom:8px;">🧾 Order Receipt</h3>
        <table width="100%" style="border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="text-align:left; border-bottom:2px solid #eee;">
              <th>Product</th>
              <th align="center">Qty</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

        <table width="100%" style="font-size:14px;">
          <tr>
            <td><strong>Subtotal</strong></td>
            <td align="right">₦${order.itemsPrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Shipping</strong></td>
            <td align="right">₦${order.shippingPrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding-top:10px; font-size:16px;"><strong>Total Paid</strong></td>
            <td align="right" style="padding-top:10px; font-size:16px;"><strong>₦${order.totalPrice.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Shipping Info -->
      <div style="background:#f9fafb; padding:20px; font-size:14px;">
        <h3 style="margin-top:0;">📦 Shipping Details</h3>
        <p style="margin:4px 0;">${order.shippingAddress}</p>
        <p style="margin:4px 0;">${order.city}, ${order.country}</p>
        <p style="margin:4px 0;">Phone: ${order.phoneNo}</p>
      </div>

      <!-- Footer -->
      <div style="padding:20px; text-align:center; font-size:12px; color:#777;">
        <p>If you have any questions, just reply to this email — we’re happy to help!</p>
        <p style="margin-top:10px;">© ${new Date().getFullYear()} Zenn Ecommerce</p>
      </div>
    </div>
  </div>
  `;
};
