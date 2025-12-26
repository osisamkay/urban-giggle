'use client';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AdminOrdersPage() {
    const { user } = useAuthStore();
    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: ordersApi.getAllOrders,
        enabled: !!user && user.role === 'ADMIN',
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Orders...</div>;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load orders</h3>
                <p className="text-gray-500 max-w-sm mb-6">There was an issue fetching order data. Please try again.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Items</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium font-mono text-xs">#{order.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.buyer?.first_name} {order.buyer?.last_name}</span>
                                            <span className="text-gray-500 text-xs">{order.buyer?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-xs text-gray-900 max-w-[200px] truncate" title={order.items?.map((i: any) => i.product?.title).join(', ')}>
                                        {order.items?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                           ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}
                                       `}>
                                            {order.status.toLowerCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
