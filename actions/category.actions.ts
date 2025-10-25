import { prisma } from '@/lib/prisma';
export const getAllCategories = async () => {
  const data = await prisma.category.findMany();
  console.log(data);
  return data;
};

export const getProductsByCategory = async (category: string) => {
  const data = await prisma.category.findUniqueOrThrow({ where: { slug: category }, include: { products: true } });
  return data;
};
