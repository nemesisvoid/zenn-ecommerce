import { categories, products, productVariants, users } from '@/sample/sample-data';

import { prisma } from '../lib/prisma';
async function main() {
  try {
    // Clear existing data
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Seed categories
    const createdCategories = await prisma.category.createMany({ data: categories });

    // Seed products
    const createProduct = await prisma.product.createMany({ data: products });

    // Seed product variants
    await prisma.productVariant.createMany({ data: productVariants });

    // Seed users
    const createdUsers = await prisma.user.createMany({ data: users });

    console.log(createdUsers, createdCategories);

    console.log('Database seeded successfully! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
