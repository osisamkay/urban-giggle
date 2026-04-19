'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SellerProductsPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getSellerProducts(user!.id);
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await productsApi.updateProduct(productId, { status: newStatus });
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Failed to update product status');
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    return product.status.toLowerCase() === filter;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'ACTIVE').length,
    inactive: products.filter((p) => p.status === 'INACTIVE').length,
    draft: products.filter((p) => p.status === 'DRAFT').length,
  };

  if (!user || user.role !== 'SELLER' && user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your product listings</p>
          </div>
          <Link
            href="/seller/products/new"
            className="bg-gradient-to-r from-meat-600 to-meat-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-meat-700 hover:to-meat-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow ${filter === 'all' ? 'ring-2 ring-meat-600' : ''
              }`}
          >
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </button>

          <button
            onClick={() => setFilter('active')}
            className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow ${filter === 'active' ? 'ring-2 ring-meat-600' : ''
              }`}
          >
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </button>

          <button
            onClick={() => setFilter('inactive')}
            className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow ${filter === 'inactive' ? 'ring-2 ring-meat-600' : ''
              }`}
          >
            <p className="text-sm text-gray-600 mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
          </button>

          <button
            onClick={() => setFilter('draft')}
            className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow ${filter === 'draft' ? 'ring-2 ring-meat-600' : ''
              }`}
          >
            <p className="text-sm text-gray-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-orange-600">{stats.draft}</p>
          </button>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No products yet' : `No ${filter} products`}
            </h3>
            <p className="text-gray-600 mb-6">Start by creating your first product listing</p>
            <Link
              href="/seller/products/new"
              className="inline-block bg-meat-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors"
            >
              Create Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${product.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Price:</span>{' '}
                        <span className="text-meat-600 font-semibold">
                          ${product.price.toFixed(2)}/{product.unit}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Inventory:</span> {product.inventory} units
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {product.category}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(product.id, product.status)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm ${product.status === 'ACTIVE'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                      >
                        {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
