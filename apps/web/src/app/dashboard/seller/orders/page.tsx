'use client';

import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

export default function SellerOrdersPage() {
    const user = useAuthStore((state) => state.user);
    const [statusFilter, setStatusFilter] = useState('All Statuses');

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await ordersApi.getSellerOrders(user.id);
        },
        enabled: !!user,
    });

    const filteredOrders = statusFilter === 'All Statuses'
        ? orders
        : orders.filter((order: any) => order.status === statusFilter.toUpperCase());

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Orders</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="flex-1 border-gray-300 rounded-lg shadow-sm font-sm px-4 py-2"
                    />
                    <select
                        className="border-gray-300 rounded-lg shadow-sm font-sm px-4 py-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono">#{order.id.slice(0, 8)}</td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {order.buyer?.first_name} {order.buyer?.last_name}
                                    </td>
                                    <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">${order.total.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/dashboard/seller/orders/${order.id}`}
                                            className="text-meat-600 hover:text-meat-800 font-medium"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder - implementation can be added later if needed */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Showing {filteredOrders.length} orders</span>
                </div>
            </div>
        </div>
    );
}
