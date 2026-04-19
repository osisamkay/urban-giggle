'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import { ImageUpload } from '@/components/ImageUpload';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

type ProductCategory = 'BEEF' | 'PORK' | 'CHICKEN' | 'LAMB' | 'SEAFOOD' | 'GAME' | 'OTHER';
type ProductUnit = 'lb' | 'kg' | 'oz' | 'piece' | 'pack';
type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

const categories: ProductCategory[] = ['BEEF', 'PORK', 'CHICKEN', 'LAMB', 'SEAFOOD', 'GAME', 'OTHER'];
const units: ProductUnit[] = ['lb', 'kg', 'oz', 'piece', 'pack'];
const statuses: ProductStatus[] = ['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        unit: 'lb' as ProductUnit,
        category: 'BEEF' as ProductCategory,
        inventory: '',
        status: 'ACTIVE' as ProductStatus,
    });
    const [images, setImages] = useState<string[]>([]);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getProduct(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (product) {
            const p = product as any;
            setFormData({
                title: p.title || '',
                description: p.description || '',
                price: String(p.price || ''),
                unit: p.unit || 'lb',
                category: p.category || 'BEEF',
                inventory: String(p.inventory || ''),
                status: p.status || 'ACTIVE',
            });
            setImages(p.images || []);
        }
    }, [product]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await productsApi.updateProduct(id, {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                unit: formData.unit,
                category: formData.category,
                inventory: parseInt(formData.inventory) || 0,
                status: formData.status,
                images,
            } as any);

            setSuccess('Product updated successfully!');
            setTimeout(() => router.push('/dashboard/seller/products'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E4F4F] mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <Link href="/dashboard/seller/products" className="text-gray-600 hover:text-gray-900 text-sm">
                    ← Back to Products
                </Link>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            )}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none" />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={4} required value={formData.description} onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none" />
                </div>

                {/* Price + Unit + Category */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" step="0.01" required value={formData.price} onChange={(e) => handleChange('price', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <select value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none">
                            {units.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none">
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Inventory + Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inventory</label>
                        <input type="number" required value={formData.inventory} onChange={(e) => handleChange('inventory', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F] outline-none">
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                    <ImageUpload initialImages={images} onUpload={(urls) => setImages(urls)} maxImages={5} />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={isSubmitting}
                        className="flex-1 bg-[#2E4F4F] text-white py-3 rounded-lg font-semibold hover:bg-[#253F3F] disabled:opacity-50 transition-colors">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link href="/dashboard/seller/products"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
