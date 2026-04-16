'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  description?: string;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  rating = 0,
  reviews = 0,
  badge,
  description,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.();
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/products/${id}`}>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Product Image */}
          <div className="relative h-48 bg-gradient-to-br from-meat-100 to-meat-200 overflow-hidden">
            {/* Placeholder - replace with actual image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-meat-400 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-3 left-3"
              >
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                    badge === 'Bestseller'
                      ? 'bg-meat-600 text-white'
                      : badge === 'New'
                      ? 'bg-blue-600 text-white'
                      : badge === 'Premium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {badge}
                </span>
              </motion.div>
            )}

            {/* Wishlist button */}
            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                isWishlisted
                  ? 'bg-meat-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-meat-50'
              }`}
            >
              <svg
                className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
                fill={isWishlisted ? 'currentColor' : 'none'}
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
            </motion.button>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Product Details */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-meat-600 transition-colors line-clamp-2">
              {name}
            </h3>

            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 fill-current'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({reviews})</span>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-meat-600">
                  ${price.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">per lb</div>
              </div>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-meat-600 to-meat-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-meat-700 hover:to-meat-800 transition-all shadow-md hover:shadow-lg"
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
