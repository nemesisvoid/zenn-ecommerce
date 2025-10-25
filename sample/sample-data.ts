import { hashSync } from 'bcrypt';

export const categories = [
  {
    id: 'all-products',
    name: 'All Products',
    slug: 'all-products',
    description: 'All available products',
    coverImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
  },
  {
    id: 'sneakers',
    name: 'Sneakers',
    slug: 'sneakers',
    description: 'Premium sneakers and athletic shoes',
    coverImage: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
  },
  {
    id: 'traditional-wear',
    name: 'Traditional Wear',
    slug: 'traditional-wear',
    description: 'Nigerian traditional clothing',
    coverImage: 'https://images.unsplash.com/photo-1544461772-722f2a3cf882',
  },
];

export const products = [
  {
    id: 'nike-air-force-1',
    name: 'Nike Air Force 1',
    slug: 'nike-air-force-1',
    price: 125000,
    discountPercent: 10,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f',
    ],
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['White', 'Black', 'Grey'],
    coverImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    stock: 30,
    categoryId: 'sneakers',
    description: 'Classic Nike Air Force 1 sneakers. Perfect for everyday wear.',
    isFeatured: true,
    rating: 4.7,
    numReviews: 15,
  },
  {
    id: 'nike-air-force-2',
    name: 'Nike Air Force 2 ',
    slug: 'nike-air-force-2',
    price: 125000,
    discountPercent: 10,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f',
    ],
    sizes: ['40', '41', '42', '43', '44'],
    colors: ['White', 'Black', 'Grey'],
    coverImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    stock: 30,
    categoryId: 'sneakers',
    description: 'Classic Nike Air Force 1 sneakers. Perfect for everyday wear.',
    isFeatured: true,
    rating: 4.7,
    numReviews: 15,
  },
  {
    // ID added here
    id: 'premium-agbada-set',
    name: 'Premium Agbada Set',
    slug: 'premium-agbada-set',
    price: 85000,
    discountPercent: 0,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1544461772-722f2a3cf883',
      'https://images.unsplash.com/photo-1544461772-722f2a3cf884',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Gold', 'Blue', 'Green'],
    coverImage: 'https://images.unsplash.com/photo-1544461772-722f2a3cf882',
    stock: 20,
    categoryId: 'traditional-wear',
    description: 'Luxurious traditional Nigerian Agbada set with premium embroidery.',
    isFeatured: true,
    rating: 4.9,
    numReviews: 8,
  },
  {
    // ID added here
    id: 'adidas-ultra-boost',
    name: 'Adidas Ultra Boost',
    slug: 'adidas-ultra-boost',
    price: 155000,
    discountPercent: 15,
    images: [
      'https://images.unsplash.com/photo-1588361035994-7e2037b60157',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb',
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329',
    ],
    sizes: ['41', '42', '43', '44', '45'],
    colors: ['Black', 'White', 'Red'],
    coverImage: 'https://images.unsplash.com/photo-1588361035994-7e2037b60157',
    stock: 25,
    categoryId: 'sneakers',
    description: 'Premium Adidas Ultra Boost running shoes with responsive cushioning.',
    isFeatured: false,
    rating: 4.6,
    numReviews: 10,
  },
];

export const productVariants = [
  {
    productId: 'nike-air-force-1', // Corrected to match the product ID
    color: 'White',
    size: '42',
    price: 125000,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f',
      'https://ibb.co/svgYyS2V',
      'https://ibb.co/svgYyS2V',
    ],
    sku: 'NK-AF1-WHT-42',
  },
  {
    productId: 'nike-air-force-1', // Corrected to match the product ID
    color: 'Black',
    size: '43',
    price: 125000,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f',
    ],
    stock: 8,
    sku: 'NK-AF1-BLK-43',
  },
  {
    productId: 'nike-air-force-1', // Corrected to match the product ID
    color: 'Red',
    size: '43',
    price: 125000,
    images: ['https://ibb.co/Mk9TLjQx', 'https://ibb.co/393CL4bB'],
    stock: 8,
    sku: 'NK-AF1-RED-43',
  },
  {
    productId: 'premium-agbada-set', // Corrected to match the product ID
    color: 'Gold',
    size: 'L',
    price: 85000,
    stock: 5,
    sku: 'AGB-GLD-L',
  },
  {
    productId: 'adidas-ultra-boost', // Corrected to match the product ID
    color: 'Black',
    size: '42',
    price: 155000,
    stock: 12,
    sku: 'ADS-UB-BLK-42',
  },
];
export const users = [
  {
    email: 'admin@example.com',
    password: hashSync('admin123', 10), // Remember to hash properly in production
    firstName: 'Admin',
    lastName: 'User',
    phone: '+2348012345678',
    isEmailVerified: true,
    address: '123 Victoria Island, Lagos',
  },
  {
    email: 'customer@example.com',
    password: hashSync('pass123', 10), // Remember to hash properly in production
    firstName: 'David',
    lastName: 'Benson',
    phone: '+2349087654321',
    isEmailVerified: true,
    address: '456 Lekki Phase 1, Lagos',
  },
];
