'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { productsApi } from '@/lib/api';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    INACTIVE: 'bg-gray-100 text-gray-600',
    OUT_OF_STOCK: 'bg-red-100 text-red-800',
};

export default function SellerProductsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['seller-products', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await productsApi.getSellerProducts(user.id);
        },
        enabled: !!user?.id,
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                <Link
                    href="/seller/products/new"
                    className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 shadow-sm"
                >
                    + Add Product
                </Link>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading products...</p>
                </div>
            ) : (products as any[]).length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first product to the marketplace.</p>
                    <Link
                        href="/seller/products/new"
                        className="inline-block bg-meat-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-meat-700"
                    >
                        + Add Your First Product
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price / Unit</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(products as any[]).map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                            {product.images?.[0] ? (
                                                <Image src={product.images[0]} alt={product.title} width={40} height={40} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">{product.title}</span>
                                    </td>
                                    <td className="p-4">{product.category}</td>
                                    <td className="p-4">${product.price?.toFixed(2)} / {product.unit}</td>
                                    <td className="p-4">{product.inventory} {product.unit}s</td>
                                    <td className="p-4">
                                        {product.average_rating ? (
                                            <span className="flex items-center gap-1">
                                                <span className="text-yellow-400">⭐</span>
                                                {product.average_rating.toFixed(1)} ({product.review_count})
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-3">
                                        <Link href={`/products/${product.id}`} className="text-meat-600 hover:text-meat-700 text-sm font-medium">
                                            View
                                        </Link>
                                        <Link href={`/seller/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this product?')) {
                                                    try {
                                                        await productsApi.deleteProduct(product.id);
                                                        window.location.reload();
                                                    } catch (err) {
                                                        alert('Failed to delete product');
                                                    }
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
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
