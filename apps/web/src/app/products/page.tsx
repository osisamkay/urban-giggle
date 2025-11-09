'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ProductsAPI } from '@sharesteak/api-client';
import type { ProductCategory } from '@sharesteak/types';
import { Navbar } from '@/components/Navbar';

const categories: ProductCategory[] = ['BEEF', 'PORK', 'CHICKEN', 'LAMB', 'SEAFOOD', 'GAME', 'OTHER'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const productsAPI = new ProductsAPI(supabase);

  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      const result = await productsAPI.getProducts({ category: selectedCategory });
      return result.data;
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ['products-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
      const result = await productsAPI.searchProducts(searchQuery);
      return result.data;
    },
    enabled: searchQuery.length > 2,
  });

  const products = searchQuery ? searchResults : data?.items;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Products
          </h1>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-lg transition ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="aspect-square bg-gray-200 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">/{product.unit}</span>
                    </div>
                    {product.averageRating && (
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {product.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {product.inventory > 0 ? (
                    <div className="mt-2 text-sm text-green-600">
                      In Stock ({product.inventory} available)
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-red-600">Out of Stock</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
