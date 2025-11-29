'use client';

import { formatCurrency } from '@/helper/utils';
import { ProductType, CategoryType, VariantType, ColorImageType } from '@/types'; // Adjust imports to match your project
import { Copy, Edit3, ExternalLink, Box, Tag, Layers, CheckCircle, AlertCircle, Hash, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

// Extended interface to match your Prisma "include" queries
interface ExtendedProduct extends ProductType {
  categories: { id: string; name: string; coverImage: string }[];
  variants: any[]; // Replace with your strict Variant type
  colorImages: { color: string; images: string[] }[];
}

interface AdminProductDetailsProps {
  product: ExtendedProduct;
}

const AdminProductDetails = ({ product }: AdminProductDetailsProps) => {
  const [activeImage, setActiveImage] = useState<string>(product.images[0]);
  const [selectedColorView, setSelectedColorView] = useState<string | 'ALL'>('ALL');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const router = useRouter();
  // --- DERIVED STATE ---

  // Calculate total stock across all variants or fallback to main stock
  const totalStock = product.hasVariants ? product.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) : product.stock;

  // Determine which images to show in the gallery grid
  const currentGalleryImages = useMemo(() => {
    if (selectedColorView === 'ALL') return product.images;

    const colorSet = product.colorImages.find(ci => ci.color === selectedColorView);
    return colorSet ? colorSet.images : product.images;
  }, [product.images, product.colorImages, selectedColorView]);

  // Handle SKU Copy
  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  console.log('selected', selectedColorView, currentGalleryImages);

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-8'>
      {/* --- HEADER --- */}
      <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 mb-2'>
            {product.isFeatured && (
              <span className='px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200'>
                Featured
              </span>
            )}
            {product.isArchived && (
              <span className='px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200'>
                Archived
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                totalStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
              {totalStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>{product.name}</h1>
          <p className='text-gray-500 text-sm mt-1 flex items-center gap-2'>ID: {product.id}</p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm'
            onClick={() => router.push(`/product/${product.slug}`)}>
            <ExternalLink size={16} />
            Store View
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* --- LEFT COLUMN (2/3) --- */}
        <div className='lg:col-span-2 space-y-8'>
          {/* 1. Main Stats & Categories */}
          <div className='bg-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Description */}
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>About this product</h3>
                <p className='text-sm text-gray-600 leading-relaxed'>{product.description}</p>
                <div className='pt-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-3'>Categories</p>
                  <div className='flex flex-wrap gap-2'>
                    {product.categories?.length > 0 ? (
                      product.categories.map(cat => (
                        <div
                          key={cat.id}
                          className='flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-full'>
                          {cat.coverImage && (
                            <div className='relative w-5 h-5 rounded-full overflow-hidden'>
                              <Image
                                src={cat.coverImage}
                                alt={cat.name}
                                fill
                                className='object-cover'
                              />
                            </div>
                          )}
                          <span className='text-xs font-medium text-gray-700'>{cat.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className='text-sm text-gray-400 italic'>Uncategorized</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className='grid grid-cols-2 gap-4 h-fit'>
                <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                  <p className='text-xs text-gray-500 mb-1'>Base Price</p>
                  <p className='text-xl font-bold text-gray-900'>{formatCurrency(product.price)}</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                  <p className='text-xs text-gray-500 mb-1'>Total Stock</p>
                  <p className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                    {totalStock}
                    <Box
                      size={16}
                      className='text-gray-400'
                    />
                  </p>
                </div>
                <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                  <p className='text-xs text-gray-500 mb-1'>Discount</p>
                  <p className='text-xl font-bold text-gray-900'>{product.discountPercent || 0}%</p>
                </div>
                <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                  <p className='text-xs text-gray-500 mb-1'>Reviews</p>
                  <p className='text-xl font-bold text-gray-900 flex items-center gap-1'>
                    {product.rating || '-'} <span className='text-xs font-normal text-gray-400'>/ 5.0</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Variants Table (The Upgrade) */}
          {product.hasVariants && (
            <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center'>
                <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                  <Layers
                    size={16}
                    className='text-blue-600'
                  />
                  Variants Breakdown
                </h3>
                <span className='text-xs bg-gray-100 px-2 py-1 rounded text-gray-600'>{product.variants.length} items</span>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                  <thead className='text-xs text-gray-500 uppercase bg-gray-50/50'>
                    <tr>
                      <th className='px-6 py-3 font-medium'>Details (Color / Size)</th>
                      <th className='px-6 py-3 font-medium'>Price Override</th>
                      <th className='px-6 py-3 font-medium'>SKU</th>
                      <th className='px-6 py-3 font-medium text-right'>Stock</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {product.variants.map(variant => (
                      <tr
                        key={variant.id}
                        className='hover:bg-gray-50/50 transition-colors'>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            {variant.color && (
                              <span
                                className='w-4 h-4 rounded-full border border-gray-200 shadow-sm'
                                style={{ backgroundColor: variant.color }}
                                title={variant.color}
                              />
                            )}
                            <div className='flex flex-col'>
                              <span className='font-medium text-gray-900 capitalize'>
                                {variant.color || 'No Color'}
                                {variant.size && ` / ${variant.size}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-gray-600'>
                          {variant.price ? formatCurrency(variant.price) : <span className='text-gray-400 italic text-xs'>Uses Base</span>}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2 group'>
                            <span className='font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>{variant.sku || 'N/A'}</span>
                            {variant.sku && (
                              <button
                                onClick={() => handleCopySku(variant.sku)}
                                className='opacity-0 group-hover:opacity-100 transition-opacity'>
                                {copiedSku === variant.sku ? (
                                  <CheckCircle
                                    size={14}
                                    className='text-green-500'
                                  />
                                ) : (
                                  <Copy
                                    size={14}
                                    className='text-gray-400 hover:text-blue-500'
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-right font-medium'>
                          <span className={`${(variant.stock || 0) < 5 ? 'text-red-600' : 'text-gray-900'}`}>{variant.stock || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (Media) --- */}
        <div className='space-y-6'>
          <div className='bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sticky top-6'>
            <div className='flex items-center justify-between mb-4 px-1'>
              <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                <ImageIcon size={16} />
                Gallery
              </h3>
            </div>

            {/* Intelligent Color Filter */}
            {product.colorImages.length > 0 && (
              <div className='flex gap-2 py-3 my-4 overflow-x-auto pb-2 scrollbar-thin'>
                <button
                  onClick={() => setSelectedColorView('ALL')}
                  className={`px-3 py-1 text-xs rounded-full border transition-all whitespace-nowrap ${
                    selectedColorView === 'ALL' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  All Views
                </button>
                {product.colorImages.map(ci => (
                  <button
                    key={ci.id}
                    onClick={() => setSelectedColorView(ci.color)}
                    className={`p-1 rounded-full border-2 transition-all ${
                      selectedColorView === ci.color ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-200'
                    }`}>
                    <div
                      className='w-5 h-5 rounded-full border border-black/10'
                      style={{ backgroundColor: ci.color }}
                      title={`Show ${ci.color} images`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Preview */}
            <div className='relative aspect-[4/5] w-full bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100'>
              {currentGalleryImages.length > 0 ? (
                <Image
                  src={activeImage || currentGalleryImages[0]}
                  alt='Main view'
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='flex items-center justify-center h-full text-gray-300'>
                  <ImageIcon size={48} />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className='grid grid-cols-4 gap-2'>
              {currentGalleryImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ${
                    activeImage === img ? 'opacity-100' : 'border-transparent opacity-50 hover:border-gray-200'
                  }`}>
                  <Image
                    src={img}
                    alt={`Thumbnail ${index}`}
                    fill
                    className='object-cover'
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetails;
