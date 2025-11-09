'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Mock featured products
const featuredProducts = [
  {
    id: 1,
    name: 'Premium Ribeye Steak',
    price: 45.99,
    image: '/images/ribeye.jpg',
    rating: 4.9,
    reviews: 127,
    badge: 'Bestseller',
  },
  {
    id: 2,
    name: 'Grass-Fed Ground Beef',
    price: 12.99,
    image: '/images/ground-beef.jpg',
    rating: 4.8,
    reviews: 89,
    badge: 'Popular',
  },
  {
    id: 3,
    name: 'Organic Chicken Breast',
    price: 19.99,
    image: '/images/chicken.jpg',
    rating: 4.7,
    reviews: 64,
    badge: 'New',
  },
  {
    id: 4,
    name: 'Wagyu Beef Tenderloin',
    price: 89.99,
    image: '/images/wagyu.jpg',
    rating: 5.0,
    reviews: 43,
    badge: 'Premium',
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked premium cuts from our verified producers
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Link href={`/products/${product.id}`}>
                <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.badge === 'Bestseller'
                          ? 'bg-meat-600 text-white'
                          : product.badge === 'New'
                          ? 'bg-blue-600 text-white'
                          : product.badge === 'Premium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {product.badge}
                      </span>
                    </div>

                    {/* Wishlist button */}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-meat-50">
                      <svg
                        className="w-5 h-5 text-gray-600 hover:text-meat-600"
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
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-meat-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 fill-current'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-meat-600">
                        ${product.price}
                      </div>
                      <button className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
