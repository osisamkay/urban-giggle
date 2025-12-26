'use client';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: ordersApi.getAllOrders,
        retry: 2, // Don't retry indefinitely
        enabled: !!user && user.role === 'ADMIN', // Only fetch when admin user is authenticated
    });

    // Calculate Stats
    const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);
    const totalOrders = orders.length;
    const uniqueBuyers = new Set(orders.map((o: any) => o.buyer?.email || o.buyer_id)).size;

    // Chart Data
    const chartDataMap = new Map();
    orders.forEach((order: any) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = chartDataMap.get(date) || 0;
        chartDataMap.set(date, current + order.total);
    });
    // Reverse because orders come in desc (newest first), we want oldest -> newest for chart
    const chartData = Array.from(chartDataMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .reverse()
        .slice(-7);

    // Skeleton Loader
    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-4">
                <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="h-4 w-24 bg-slate-100 rounded mb-4"></div>
                            <div className="h-8 w-32 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="h-96 bg-white rounded-2xl border border-gray-100"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm mt-8">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load dashboard</h3>
                <p className="text-gray-500 max-w-sm mb-6">There was an issue fetching the latest sales data. This might be a temporary connection issue.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    // Empty State
    if (orders.length === 0) {
        return (
            <div className="space-y-8">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-gray-500">Welcome back, {user?.firstName || 'Admin'}</p>
                </header>
                <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-indigo-100 shadow-lg">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready for your first sale?</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">Your dashboard is looking a bit empty because no orders have been placed yet. Once sales start rolling in, you'll see analytics and insights here.</p>
                </div>
            </div>
        );
    }

    // Modern Dashboard Content
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                        Live System
                    </span>
                    <span className="text-gray-400 text-xs font-mono">{new Date().toLocaleDateString()}</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 group hover:border-meat-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">All Time</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-gray-900 font-display">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 group hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                        <h3 className="text-3xl font-bold text-gray-900 font-display">{totalOrders.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 group hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Customers</p>
                        <h3 className="text-3xl font-bold text-gray-900 font-display">{uniqueBuyers.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section - Takes up 2/3 */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                        {/* Legend/Actions could go here */}
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#e11d48"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity - Takes up 1/3 */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900">Recent Sales</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <div className="divide-y divide-gray-50">
                            {orders.slice(0, 6).map((order: any) => (
                                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {order.buyer?.first_name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {order.buyer?.first_name} {order.buyer?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                    order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'}
                                        `}>
                                            {order.status}
                                        </span>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">${(order.total || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <Link href="/admin/orders" className="block w-full text-center text-sm font-semibold text-meat-600 hover:text-meat-700 transition-colors">
                            View All Orders
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
