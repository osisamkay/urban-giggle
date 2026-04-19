'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';
import Image from 'next/image';

type Category = 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER';
const categories: Category[] = ['BEEF', 'PORK', 'CHICKEN', 'LAMB', 'SEAFOOD', 'GAME', 'OTHER'];

const priceRanges = [
  { label: 'Any', min: undefined, max: undefined },
  { label: 'Under $20', min: undefined, max: 20 },
  { label: '$20 - $50', min: 20, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: undefined },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rated', value: 'rating' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | undefined>();
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const selectedPrice = priceRanges[priceRange];

  const { data: products, isLoading } = useQuery({
    queryKey: ['search', query, category, priceRange, sortBy, page],
    queryFn: async () => {
      const results = await productsApi.getProducts({
        search: query || undefined,
        category,
        minPrice: selectedPrice.min,
        maxPrice: selectedPrice.max,
      });
      return results || [];
    },
  });

  // Client-side sort (API doesn't support sort param yet)
  const sorted = [...(products || [])].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-asc': return (a.price || 0) - (b.price || 0);
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      case 'rating': return (b.average_rating || 0) - (a.average_rating || 0);
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const pageSize = 12;
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>

        {/* Search + Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-meat-500 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category || ''}
                onChange={(e) => { setCategory(e.target.value as Category || undefined); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 outline-none"
              >
                {priceRanges.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {sorted.length} product{sorted.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-meat-500 outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : paged.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paged.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 bg-meat-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-meat-600">${product.price?.toFixed(2)}<span className="text-sm text-gray-500">/{product.unit}</span></span>
                      {product.average_rating > 0 && (
                        <span className="text-sm text-gray-600">⭐ {product.average_rating.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {product.seller?.business_name || 'ShareSteak Seller'}
                      {product.seller?.verified && ' ✓'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={sorted.length}
                pageSize={pageSize}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-2">No products match your filters</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
