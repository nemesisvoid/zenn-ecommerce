// Storefront catalogue: parsing of URL filters and the paginated product query used by the
// shop (/list) and search (/search) pages. Not a 'use server' module, so it is never exposed
// as a public action; pages call it directly on the server.
import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const CATALOG_PAGE_SIZE = 24; // divides evenly into 2-, 3- and 4-column grids

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'name', label: 'Name: A to Z' },
] as const;

export type CatalogSort = (typeof SORT_OPTIONS)[number]['value'];

export type CatalogFilters = {
  query: string;
  categories: string[]; // category slugs
  minPrice: number | null;
  maxPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  sort: CatalogSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

const toPrice = (value: string) => {
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

/** Turns URL search params into validated filters. Unknown or malformed values fall back to defaults. */
export const parseCatalogParams = (params: RawParams): CatalogFilters => {
  const sortParam = first(params.sort);
  const sort = (SORT_OPTIONS.some(o => o.value === sortParam) ? sortParam : 'newest') as CatalogSort;

  let minPrice = toPrice(first(params.minPrice));
  let maxPrice = toPrice(first(params.maxPrice));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  const page = Math.floor(Number(first(params.page)));

  return {
    query: first(params.query).trim().slice(0, 100),
    categories: first(params.category)
      .split(',')
      .map(s => s.trim())
      // "all-products" contains everything, so treat it as no category filter (old links use it).
      .filter(s => s && s !== 'all-products')
      .slice(0, 20),
    minPrice,
    maxPrice,
    onSale: first(params.sale) === '1',
    inStock: first(params.stock) === '1',
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
};

const ORDER_BY: Record<CatalogSort, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }],
  'price-asc': [{ price: 'asc' }, { createdAt: 'desc' }],
  'price-desc': [{ price: 'desc' }, { createdAt: 'desc' }],
  discount: [{ discountPercent: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  name: [{ name: 'asc' }],
};

const buildWhere = (filters: CatalogFilters): Prisma.ProductWhereInput => {
  const and: Prisma.ProductWhereInput[] = [{ isArchived: false }];

  if (filters.query) {
    and.push({
      OR: [{ name: { contains: filters.query, mode: 'insensitive' } }, { description: { contains: filters.query, mode: 'insensitive' } }],
    });
  }
  if (filters.categories.length > 0) and.push({ categories: { some: { slug: { in: filters.categories } } } });
  // Price filtering happens in getCatalogPage, on the discounted price shoppers actually see.
  if (filters.onSale) and.push({ discountPercent: { gt: 0 } });
  if (filters.inStock) and.push({ stock: { gt: 0 } });

  return { AND: and };
};

const cardSelect = { id: true, slug: true, name: true, price: true, images: true, discountPercent: true } as const;

/** The price a shopper sees on the card: base price minus the product discount. */
const effectivePrice = (p: { price: number; discountPercent: number | null }) => p.price * (1 - (p.discountPercent ?? 0) / 100);

export const getCatalogPage = async (filters: CatalogFilters) => {
  const where = buildWhere(filters);
  const byPrice = filters.sort === 'price-asc' || filters.sort === 'price-desc';
  const hasPriceFilter = filters.minPrice !== null || filters.maxPrice !== null;

  // Simple path: the database filters, sorts and paginates.
  if (!byPrice && !hasPriceFilter) {
    const total = await prisma.product.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    const page = Math.min(filters.page, pageCount); // a page past the end shows the last page
    const products = await prisma.product.findMany({
      where,
      orderBy: ORDER_BY[filters.sort],
      skip: (page - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
      select: cardSelect,
    });
    return { products, total, page, pageCount };
  }

  // Price path: the sale price is computed, so the database can't filter or sort on it.
  // Load only id/price/discount for the matches, filter and sort here, then fetch the one page.
  const candidates = await prisma.product.findMany({
    where,
    orderBy: ORDER_BY[filters.sort],
    select: { id: true, price: true, discountPercent: true },
  });
  const matching = candidates.filter(p => {
    const price = effectivePrice(p);
    return (filters.minPrice === null || price >= filters.minPrice) && (filters.maxPrice === null || price <= filters.maxPrice);
  });
  if (byPrice) {
    const dir = filters.sort === 'price-asc' ? 1 : -1;
    matching.sort((a, b) => (effectivePrice(a) - effectivePrice(b)) * dir); // stable: ties keep newest-first
  }

  const total = matching.length;
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const ids = matching.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE).map(p => p.id);

  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, select: cardSelect });
  const byId = new Map(rows.map(r => [r.id, r]));
  const products = ids.map(id => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p);

  return { products, total, page, pageCount };
};

/** Upper bound for the price slider: the highest active product price, rounded up to a clean number. */
export const getPriceCeiling = async () => {
  const { _max } = await prisma.product.aggregate({ where: { isArchived: false }, _max: { price: true } });
  const max = _max.price ?? 0;
  if (max <= 0) return 100_000;
  const step = max > 1_000_000 ? 100_000 : max > 100_000 ? 10_000 : 1_000;
  return Math.ceil(max / step) * step;
};

/** Categories for the filter list (excludes the catch-all "All Products"). */
// Wrapped in cache() so a page and the catalogue it renders share one query per request.
export const getFilterCategories = cache(() =>
  prisma.category.findMany({
    where: { slug: { not: 'all-products' } },
    select: { slug: true, name: true, description: true },
    orderBy: { name: 'asc' },
  }),
);

/** Builds a catalogue URL from the current filters with some values changed. Changing any filter resets to page 1. */
export const catalogHref = (pathname: string, current: RawParams, changes: Record<string, string | null>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    const v = first(value);
    if (v) params.set(key, v);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
  }
  if (!('page' in changes)) params.delete('page');
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
};
