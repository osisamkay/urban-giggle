'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wishlistApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist } = useWishlistStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const data = await wishlistApi.getUserWishlist();
        setWishlistItems(data || []);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user, router]);

  if (!user) {
    return null;
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      setWishlistItems(items => items.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length > 0
              ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`
              : 'Save your favorite products here'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link
              href="/products"
              className="inline-block bg-meat-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const inStock = product.inventory > 0 && product.status === 'ACTIVE';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 relative">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <span className="absolute top-3 left-3 px-3 py-1 bg-meat-600 text-white text-xs font-semibold rounded-full">
                      {product.category}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.seller?.business_name || 'ShareSteak'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-meat-600">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">/{product.unit}</p>
                      </div>
                      {inStock ? (
                        <span className="text-xs text-green-600 font-medium">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    {product.average_rating && (
                      <div className="flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {product.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm text-center"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-4 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={!inStock}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-meat-50 border border-meat-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Share your wishlist
                </h3>
                <p className="text-sm text-gray-600">
                  Let others know what you're interested in
                </p>
              </div>
              <button className="px-6 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 font-medium">
                Share List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
