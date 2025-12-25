'use client';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import Image from 'next/image';

export default function AdminProductsPage() {
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: productsApi.getAdminProducts
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Products...</div>;

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
