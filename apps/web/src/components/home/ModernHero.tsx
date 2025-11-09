'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';

const heroImages = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
  '/images/hero-4.jpg',
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ModernHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-white via-meat-50 to-meat-100 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233d665e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating animated shapes */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 bg-meat-accent/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-meat-600/5 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={item}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                Quality Meat,{' '}
                <span className="text-meat-600 relative">
                  Direct from Producers
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-meat-accent/30 -z-10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Join group purchases to unlock wholesale prices. Connect with
              trusted producers. Build community around quality meat.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8"
            >
              <Link href="/products">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/groups">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join Group Purchase
                </Button>
              </Link>
            </motion.div>

            {/* User avatars and rating */}
            <motion.div variants={item} className="flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-meat-400 to-meat-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-900">10,000+</span> happy customers
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Image carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative h-[400px] sm:h-[500px] lg:h-[600px]"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              {/* Placeholder for now - you can add actual images */}
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-br from-meat-500 to-meat-700 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <svg
                    className="w-32 h-32 mx-auto mb-4 opacity-50"
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
                  <p className="text-lg opacity-75">Premium Quality Meat</p>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-meat-accent rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-meat-600 rounded-full opacity-10 blur-2xl" />
            </div>

            {/* Carousel indicators */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'w-8 bg-meat-600'
                      : 'w-2 bg-meat-300 hover:bg-meat-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 pt-12 border-t border-gray-200"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-meat-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
              >
                500+
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600 mt-2">Quality Products</div>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-meat-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 200 }}
              >
                50+
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600 mt-2">Verified Producers</div>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-meat-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
              >
                10K+
              </motion.div>
              <div className="text-xs sm:text-sm text-gray-600 mt-2">Happy Customers</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
