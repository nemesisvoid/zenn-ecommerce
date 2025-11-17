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
