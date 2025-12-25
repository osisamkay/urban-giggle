'use client';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: ordersApi.getAllOrders,
    });

    // Calculate Stats
    const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);
    const totalOrders = orders.length;
    // Unique buyers logic
    const uniqueBuyers = new Set(orders.map((o: any) => o.buyer_id)).size;

    // Chart Data: Revenue by Day (last 7 days from available data)
    // Grouping by date.
    const chartDataMap = new Map();

    orders.forEach((order: any) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = chartDataMap.get(date) || 0;
        chartDataMap.set(date, current + order.total);
    });

    const chartData = Array.from(chartDataMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .reverse() // Orders are desc, so map is desc. Reverse to asc for chart? 
        // Wait, map iteration order is insertion order?
        // ordersApi returns DESC. So newest first.
        // So chartDataMap has newest date inserted first.
        // So Array.from is [Newest, ..., Oldest]
        // Reverse gives [Oldest, ..., Newest]. Correct for time series.
        .slice(-7);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Dashboard Data...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 transition-all duration-500">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="mt-2 text-xs text-green-600 font-medium">↑ All time</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Unique Customers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueBuyers}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trends</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#e11d48" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.slice(0, 10).map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium font-mono text-xs">#{order.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.buyer?.first_name} {order.buyer?.last_name}</span>
                                            <span className="text-gray-500 text-xs">{order.buyer?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
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
    )
}
