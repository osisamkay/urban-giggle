'use client';

import { use } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      return await productsApi.getProduct(id);
    },
  });

  const handleAddToCart = () => {
    if (productData) {
      addItem(productData, quantity);
      router.push('/cart');
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-500">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/products" className="hover:text-primary-600">
            Products
          </Link>
          {' / '}
          <span>{productData.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
              {productData.images && productData.images.length > 0 ? (
                <img
                  src={productData.images[0]}
                  alt={productData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            {productData.images && productData.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productData.images.slice(1).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-200 rounded overflow-hidden">
                    <img src={img} alt={`${productData.title} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {productData.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productData.title}
            </h1>

            {productData.averageRating && (
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(productData.averageRating!)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } fill-current`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({productData.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary-600">
                ${productData.price.toFixed(2)}
              </span>
              <span className="text-gray-500 text-lg">/{productData.unit}</span>
            </div>

            <p className="text-gray-700 mb-6">{productData.description}</p>

            {/* Stock Status */}
            {productData.inventory > 0 ? (
              <div className="mb-6 text-green-600 font-medium">
                In Stock ({productData.inventory} available)
              </div>
            ) : (
              <div className="mb-6 text-red-600 font-medium">Out of Stock</div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={productData.inventory === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <Link
                href="/groups"
                className="block w-full bg-white text-primary-600 border-2 border-primary-600 py-3 rounded-lg font-semibold text-center hover:bg-primary-50 transition"
              >
                Join Group Purchase
              </Link>
            </div>

            {/* Seller Info */}
            {productData.seller && (
              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Sold by</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{productData.seller.businessName}</div>
                    {productData.seller.verified && (
                      <div className="text-sm text-green-600">✓ Verified Seller</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Rating: {productData.seller.rating.toFixed(1)}/5
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          {productData.reviews && productData.reviews.length > 0 ? (
            <div className="space-y-6">
              {productData.reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{review.user?.firstName || 'Anonymous'}</div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            } fill-current`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.verified && (
                      <span className="text-sm text-green-600">✓ Verified Purchase</span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
