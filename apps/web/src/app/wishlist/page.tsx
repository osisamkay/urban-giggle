'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WishlistPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    // TODO: Fetch wishlist items from API
  }, [user, router]);

  if (!user) {
    return null;
  }

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
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

        {wishlistItems.length === 0 ? (
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
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <div className="aspect-square bg-gray-200" />
                  {item.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-meat-600 text-white text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
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
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.producer}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-meat-600">
                        ${item.price}
                      </p>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                    </div>
                    {item.inStock ? (
                      <span className="text-xs text-green-600 font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${item.id}`}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm text-center"
                    >
                      View
                    </Link>
                    <button
                      className="flex-1 px-4 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={!item.inStock}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
