'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';
import { useState } from 'react';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    DRAFT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200',
    OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
};

export default function SellerProductsPage() {
    const user = useAuthStore((state) => state.user);
    const [view, setView] = useState<'grid' | 'table'>('grid');

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['seller-products', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await productsApi.getSellerProducts(user.id);
        },
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                    <p className="text-sm text-gray-500 mt-1">{(products as any[]).length} products</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="bg-white rounded-xl border border-gray-200 p-1 flex">
                        <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-[#2E4F4F] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/></svg>
                        </button>
                        <button onClick={() => setView('table')} className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-[#2E4F4F] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1zM0 4.5A.5.5 0 0 1 .5 4h15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1zM0 8.5A.5.5 0 0 1 .5 8h15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1zM0 12.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5v-1z"/></svg>
                        </button>
                    </div>
                    <Link href="/dashboard/seller/products/new" className="bg-[#2E4F4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#253F3F] transition-colors shadow-sm">
                        + Add Product
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E4F4F] mx-auto" />
                    <p className="text-gray-500 mt-4 text-sm">Loading products...</p>
                </div>
            ) : (products as any[]).length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start by adding your first product to the marketplace.</p>
                    <Link href="/dashboard/seller/products/new" className="inline-block bg-[#2E4F4F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#253F3F] transition-colors">
                        + Add Your First Product
                    </Link>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(products as any[]).map((product: any) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                {product.images?.[0] ? (
                                    <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[product.status] || 'bg-gray-50 text-gray-600'}`}>
                                        {product.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.title}</h3>
                                <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-bold text-[#2E4F4F]">${product.price?.toFixed(2)}<span className="text-sm text-gray-400 font-normal">/{product.unit}</span></span>
                                    <span className="text-sm text-gray-500">{product.inventory} in stock</span>
                                </div>
                                {product.average_rating > 0 && (
                                    <div className="flex items-center gap-1 mb-4">
                                        <span className="text-yellow-400">⭐</span>
                                        <span className="text-sm text-gray-600">{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/seller/products/${product.id}/edit`} className="flex-1 text-center py-2 px-3 bg-[#2E4F4F]/5 text-[#2E4F4F] rounded-xl text-sm font-medium hover:bg-[#2E4F4F]/10 transition-colors">
                                        Edit
                                    </Link>
                                    <Link href={`/dashboard/seller/products/${product.id}`} className="flex-1 text-center py-2 px-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                                        View
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this product?')) {
                                                try { await productsApi.deleteProduct(product.id); window.location.reload(); }
                                                catch { alert('Failed to delete'); }
                                            }
                                        }}
                                        className="py-2 px-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(products as any[]).map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {product.images?.[0] ? <Image src={product.images[0]} alt={product.title} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>}
                                        </div>
                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{product.title}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4 font-semibold text-[#2E4F4F]">${product.price?.toFixed(2)}/{product.unit}</td>
                                    <td className="px-6 py-4 text-gray-600">{product.inventory}</td>
                                    <td className="px-6 py-4">{product.average_rating ? <span>⭐ {product.average_rating.toFixed(1)}</span> : <span className="text-gray-400">—</span>}</td>
                                    <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[product.status] || ''}`}>{product.status}</span></td>
                                    <td className="px-6 py-4 space-x-2">
                                        <Link href={`/dashboard/seller/products/${product.id}/edit`} className="text-[#2E4F4F] hover:underline text-sm font-medium">Edit</Link>
                                        <Link href={`/dashboard/seller/products/${product.id}`} className="text-gray-500 hover:underline text-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
