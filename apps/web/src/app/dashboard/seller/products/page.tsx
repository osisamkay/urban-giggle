'use client';

import Link from 'next/link';

export default function SellerProductsPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                <button
                    className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 shadow-sm"
                >
                    + Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price / Unit</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                                    <span className="font-medium text-gray-900">Product Name {i}</span>
                                </td>
                                <td className="p-4">Beef</td>
                                <td className="p-4">$12.99 / lb</td>
                                <td className="p-4">250 lbs</td>
                                <td className="p-4">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                                </td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
