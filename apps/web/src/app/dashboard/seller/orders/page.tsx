'use client';

import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
    SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    REFUNDED: 'bg-gray-50 text-gray-700 border-gray-200',
};

const statuses = ['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function SellerOrdersPage() {
    const user = useAuthStore((state) => state.user);
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await ordersApi.getSellerOrders(user.id);
        },
        enabled: !!user,
    });

    const filteredOrders = (orders as any[])
        .filter((o: any) => statusFilter === 'All' || o.status === statusFilter)
        .filter((o: any) => {
            if (!search) return true;
            const s = search.toLowerCase();
            return o.id?.toLowerCase().includes(s) ||
                o.buyer?.first_name?.toLowerCase().includes(s) ||
                o.buyer?.last_name?.toLowerCase().includes(s) ||
                o.buyer?.email?.toLowerCase().includes(s);
        });

    const orderCounts = (orders as any[]).reduce((acc: any, o: any) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">{(orders as any[]).length} total orders</p>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {statuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                            statusFilter === s
                                ? 'bg-[#2E4F4F] text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2E4F4F]/30 hover:text-[#2E4F4F]'
                        }`}
                    >
                        {s === 'All' ? 'All Orders' : s}
                        {s !== 'All' && orderCounts[s] ? (
                            <span className={`ml-1.5 ${statusFilter === s ? 'text-white/70' : 'text-gray-400'}`}>
                                ({orderCounts[s]})
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <input
                    type="text"
                    placeholder="Search by order ID, customer name, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-[#2E4F4F]/20 focus:bg-white outline-none transition-all"
                />
            </div>

            {/* Orders Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E4F4F] mx-auto" />
                    <p className="text-gray-500 mt-4 text-sm">Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <h3 className="font-semibold text-gray-900 mb-1">No orders found</h3>
                    <p className="text-sm text-gray-500">
                        {search ? 'Try a different search term' : statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} orders` : 'Orders will appear here when customers buy'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-[#2E4F4F]">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{order.buyer?.first_name || 'Customer'} {order.buyer?.last_name || ''}</p>
                                                <p className="text-xs text-gray-500">{order.buyer?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            ${order.total?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-gray-50 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/seller/orders/${order.id}`}
                                                className="text-[#2E4F4F] hover:text-[#253F3F] text-sm font-medium hover:underline"
                                            >
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
