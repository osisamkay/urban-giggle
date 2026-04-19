'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import { ImageUpload } from '@/components/ImageUpload';
import Link from 'next/link';

type ProductCategory = 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER';
type ProductUnit = 'lb' | 'kg' | 'oz' | 'piece' | 'pack';

export default function NewProductPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'lb' as ProductUnit,
    category: 'BEEF' as ProductCategory,
    inventory: '',
    weight: '',
    cuts: '',
    gradeQuality: '',
    farmingPractice: '',
    shippingInfo: '',
  });

  const [images, setImages] = useState<string[]>([]);

  const categories: ProductCategory[] = ['BEEF', 'PORK', 'CHICKEN', 'LAMB', 'SEAFOOD', 'GAME', 'OTHER'];
  const units: ProductUnit[] = ['lb', 'kg', 'oz', 'piece', 'pack'];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.inventory) {
      setError('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one product image');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (parseInt(formData.inventory) < 0) {
      setError('Inventory cannot be negative');
      return;
    }

    setIsSubmitting(true);

    try {
      await productsApi.createProduct({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category,
        inventory: parseInt(formData.inventory),
        images,
        status: 'ACTIVE',
      } as any);

      router.push('/dashboard/seller/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be a seller to create products.</p>
          <Link href="/" className="text-meat-600 hover:text-meat-700 font-medium">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller/products"
            className="text-meat-600 hover:text-meat-700 font-medium mb-4 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add New Product</h1>
          <p className="text-gray-600 mt-2">Create a new product listing for your store</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="e.g., Premium Ribeye Steak"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="Describe your product, including quality, taste, and what makes it special..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                    required
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
                  Inventory <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="inventory"
                  value={formData.inventory}
                  onChange={(e) => handleChange('inventory', e.target.value)}
                  min="0"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight ({formData.unit})
                </label>
                <input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Details</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="cuts" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuts/Parts
                </label>
                <input
                  type="text"
                  id="cuts"
                  value={formData.cuts}
                  onChange={(e) => handleChange('cuts', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="e.g., Ribeye, Strip, Tenderloin"
                />
              </div>

              <div>
                <label htmlFor="gradeQuality" className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Quality
                </label>
                <input
                  type="text"
                  id="gradeQuality"
                  value={formData.gradeQuality}
                  onChange={(e) => handleChange('gradeQuality', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="e.g., USDA Prime, Choice, Select"
                />
              </div>

              <div>
                <label htmlFor="farmingPractice" className="block text-sm font-medium text-gray-700 mb-2">
                  Farming Practice
                </label>
                <input
                  type="text"
                  id="farmingPractice"
                  value={formData.farmingPractice}
                  onChange={(e) => handleChange('farmingPractice', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="e.g., Grass-fed, Organic, Free-range"
                />
              </div>

              <div>
                <label htmlFor="shippingInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Information
                </label>
                <textarea
                  id="shippingInfo"
                  value={formData.shippingInfo}
                  onChange={(e) => handleChange('shippingInfo', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4F4F] focus:border-meat-500 transition-all"
                  placeholder="Shipping details, handling instructions, delivery time..."
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Product Images <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Upload high-quality images of your product. The first image will be the main product image.
            </p>

            <ImageUpload onUpload={setImages} initialImages={images} maxImages={5} />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-meat-600 to-meat-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-meat-700 hover:to-meat-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Product...
                </span>
              ) : (
                'Create Product'
              )}
            </button>

            <Link
              href="/seller/products"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
