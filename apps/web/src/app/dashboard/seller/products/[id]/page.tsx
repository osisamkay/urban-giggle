'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    DRAFT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200',
    OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
};

export default function SellerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getProduct(id),
        enabled: !!id,
    });

    const p = product as any;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E4F4F]" />
            </div>
        );
    }

    if (!p) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
                <Link href="/dashboard/seller/products" className="text-[#2E4F4F] mt-4 inline-block hover:underline">← Back to Products</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/seller/products" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/seller/products/${id}/edit`} className="bg-[#2E4F4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#253F3F] transition-colors">
                        ✏️ Edit Product
                    </Link>
                    <Link href={`/products/${id}`} target="_blank" className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                        👁 Public View
                    </Link>
                </div>
            </div>

            {/* Product Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                    {/* Image Gallery */}
                    <div className="bg-gray-50 p-6">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
                            {p.images?.[0] ? (
                                <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">No Image</div>
                            )}
                        </div>
                        {p.images && p.images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto">
                                {p.images.map((img: string, idx: number) => (
                                    <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-transparent hover:border-[#2E4F4F] transition-colors cursor-pointer">
                                        <Image src={img} alt={`${p.title} ${idx + 1}`} width={80} height={80} className="object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-8 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{p.category}</span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[p.status] || ''}`}>{p.status}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{p.title}</h2>
                            <p className="text-gray-500 leading-relaxed">{p.description}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                                    <p className="text-2xl font-bold text-[#2E4F4F]">${p.price?.toFixed(2)}<span className="text-sm text-gray-400 font-normal">/{p.unit}</span></p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Inventory</p>
                                    <p className="text-2xl font-bold text-gray-900">{p.inventory} <span className="text-sm text-gray-400 font-normal">{p.unit}s</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        {p.average_rating > 0 && (
                            <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <p className="font-bold text-gray-900">{p.average_rating.toFixed(1)} / 5.0</p>
                                    <p className="text-sm text-gray-500">{p.review_count} customer reviews</p>
                                </div>
                            </div>
                        )}

                        {/* Seller Info */}
                        {p.seller && (
                            <div className="bg-[#2E4F4F]/5 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Seller</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{p.seller.business_name}</p>
                                        <p className="text-sm text-gray-500">{p.seller.location}</p>
                                    </div>
                                    {p.seller.verified && (
                                        <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">✓ Verified</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                                <p className="text-lg font-bold text-gray-900">{p.review_count || 0}</p>
                                <p className="text-xs text-gray-500">Reviews</p>
                            </div>
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                                <p className="text-lg font-bold text-gray-900">{p.inventory || 0}</p>
                                <p className="text-xs text-gray-500">In Stock</p>
                            </div>
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                                <p className="text-lg font-bold text-[#2E4F4F]">${p.price?.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Per {p.unit}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews ({p.reviews?.length || 0})</h3>
                {p.reviews && p.reviews.length > 0 ? (
                    <div className="space-y-4">
                        {p.reviews.map((review: any) => (
                            <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {review.user?.first_name || 'Customer'} {review.user?.last_name || ''}
                                    </span>
                                </div>
                                {review.title && <p className="font-medium text-gray-900 text-sm">{review.title}</p>}
                                {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">No reviews yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
