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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
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
