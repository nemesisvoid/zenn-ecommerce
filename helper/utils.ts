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

export const getPercentagePrice = (amount: number, percentage: number) => {
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
    [[] as T[]]
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
