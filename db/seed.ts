import { prisma } from '@/lib/prisma';
async function main() {
  try {
    // Clear existing data
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Seed categories
    const allProductsCategory = await prisma.category.upsert({
      where: { slug: 'all-products' },
      update: {},
      create: {
        name: 'All Products',
        slug: 'all-products',
        description: 'All Products Category',
        coverImage: '/all-products-cover-img.png',
      },
    });

    console.log({ allProductsCategory });
    console.log('Database seeded successfully! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
