'use client';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';

export default function AdminProductsPage() {
    const { user } = useAuthStore();
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ['admin-products'],
        queryFn: productsApi.getAdminProducts,
        enabled: !!user && user.role === 'ADMIN',
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Products...</div>;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load products</h3>
                <p className="text-gray-500 max-w-sm mb-6">There was an issue fetching product data. Please try again.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Seller</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 relative rounded-md overflow-hidden bg-gray-100 shrink-0">
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900 line-clamp-1">{product.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.seller?.business_name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                            ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                         `}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">{product.inventory} {product.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
