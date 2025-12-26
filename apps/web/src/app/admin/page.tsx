'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, productsApi, usersApi, groupsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const CATEGORY_COLORS: Record<string, string> = {
    'BEEF': '#e11d48',
    'PORK': '#f97316',
    'CHICKEN': '#eab308',
    'LAMB': '#84cc16',
    'SEAFOOD': '#06b6d4',
    'GAME': '#8b5cf6',
    'OTHER': '#6b7280',
};

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const isAdmin = !!user && user.role === 'ADMIN';

    // Fetch all required data
    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: ordersApi.getAllOrders,
        retry: 2,
        enabled: isAdmin,
    });

    const { data: platformStats, isLoading: platformLoading } = useQuery({
        queryKey: ['admin-platform-stats'],
        queryFn: usersApi.getPlatformStats,
        enabled: isAdmin,
    });

    const { data: productStats, isLoading: productLoading } = useQuery({
        queryKey: ['admin-product-stats'],
        queryFn: productsApi.getProductStats,
        enabled: isAdmin,
    });

    const { data: groupStats, isLoading: groupLoading } = useQuery({
        queryKey: ['admin-group-stats'],
        queryFn: groupsApi.getGroupStats,
        enabled: isAdmin,
    });

    const { data: lowStockProducts = [] } = useQuery({
        queryKey: ['admin-low-stock'],
        queryFn: () => productsApi.getLowStockProducts(10),
        enabled: isAdmin,
    });

    const { data: pendingVerifications = [] } = useQuery({
        queryKey: ['admin-pending-verifications'],
        queryFn: usersApi.getPendingVerifications,
        enabled: isAdmin,
    });

    // Mutation for approving sellers
    const verifyMutation = useMutation({
        mutationFn: ({ id, verified }: { id: string, verified: boolean }) =>
            usersApi.verifyMerchant(id, verified),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-verifications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-platform-stats'] });
            toast.success('Seller status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const isLoading = ordersLoading || platformLoading || productLoading || groupLoading;

    // Calculate order stats
    const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.total || 0), 0);
    const totalOrders = orders.length;
    const uniqueBuyers = new Set(orders.map((o: any) => o.buyer?.email || o.buyer_id)).size;
    const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
    const shippedOrders = orders.filter((o: any) => o.status === 'SHIPPED').length;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Chart Data - Revenue by day
    const chartDataMap = new Map();
    orders.forEach((order: any) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = chartDataMap.get(date) || 0;
        chartDataMap.set(date, current + order.total);
    });
    const revenueChartData = Array.from(chartDataMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .reverse()
        .slice(-7);

    // Category pie chart data
    const categoryChartData = productStats?.categoryBreakdown
        ? Object.entries(productStats.categoryBreakdown).map(([name, value]) => ({
            name,
            value,
            color: CATEGORY_COLORS[name] || '#6b7280'
        }))
        : [];

    // Skeleton Loader
    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-white rounded-xl border border-gray-100"></div>
                    <div className="h-80 bg-white rounded-xl border border-gray-100"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.firstName || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live
                    </span>
                    <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
            </header>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-rose-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 mt-1">Avg ${avgOrderValue.toFixed(2)}/order</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Orders</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">{pendingOrders} pending, {shippedOrders} shipped</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Users</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{platformStats?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+{platformStats?.newUsersThisWeek || 0} this week</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sellers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{platformStats?.totalSellers || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{platformStats?.pendingVerifications || 0} pending approval</p>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-sm text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-100 uppercase tracking-wide">Products</span>
                        <svg className="w-5 h-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <p className="text-2xl font-bold">{productStats?.totalProducts || 0}</p>
                    <p className="text-xs text-purple-100">{productStats?.activeProducts || 0} active</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-xl shadow-sm text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-100 uppercase tracking-wide">Group Buys</span>
                        <svg className="w-5 h-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-2xl font-bold">{groupStats?.activeGroups || 0}</p>
                    <p className="text-xs text-amber-100">{groupStats?.totalParticipants || 0} participants</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500 to-teal-500 p-5 rounded-xl shadow-sm text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-cyan-100 uppercase tracking-wide">Customers</span>
                        <svg className="w-5 h-5 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                    </div>
                    <p className="text-2xl font-bold">{uniqueBuyers}</p>
                    <p className="text-xs text-cyan-100">Unique buyers</p>
                </div>

                <div className={`p-5 rounded-xl shadow-sm text-white ${(productStats?.lowStockCount || 0) > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-gray-500 to-slate-600'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-red-100 uppercase tracking-wide">Low Stock</span>
                        <svg className="w-5 h-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-2xl font-bold">{productStats?.lowStockCount || 0}</p>
                    <p className="text-xs text-red-100">{productStats?.outOfStockProducts || 0} out of stock</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - 2/3 width */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                        <span className="text-xs text-gray-400">Last 7 days</span>
                    </div>
                    {revenueChartData.length > 0 ? (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                <p className="text-sm">No revenue data yet</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Breakdown - 1/3 width */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Products by Category</h3>
                    {categoryChartData.length > 0 ? (
                        <>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {categoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [value, 'Products']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {categoryChartData.map((cat) => (
                                    <div key={cat.name} className="flex items-center gap-2 text-sm">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                        <span className="text-gray-600 capitalize">{cat.name.toLowerCase()}</span>
                                        <span className="text-gray-400 ml-auto">{cat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400">
                            <p className="text-sm">No products yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Grid - Alerts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Seller Verifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Pending Verifications</h3>
                        {(platformStats?.pendingVerifications || 0) > 0 && (
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {platformStats?.pendingVerifications}
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                        {pendingVerifications.length > 0 ? (
                            pendingVerifications.map((seller: any) => (
                                <div key={seller.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{seller.seller_profiles?.business_name || 'Unnamed Business'}</p>
                                            <p className="text-xs text-gray-500">{seller.email}</p>
                                        </div>
                                        <button
                                            onClick={() => verifyMutation.mutate({ id: seller.seller_profiles?.id, verified: true })}
                                            disabled={verifyMutation.isPending}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm">All sellers verified</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                        <Link href="/admin/merchants" className="block w-full text-center text-sm font-semibold text-meat-600 hover:text-meat-700">
                            View All Merchants
                        </Link>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Low Stock Alerts</h3>
                        {lowStockProducts.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {lowStockProducts.length}
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((product: any) => (
                                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {product.images?.[0] ? (
                                            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                                        <p className="text-xs text-gray-500">{product.seller?.business_name}</p>
                                    </div>
                                    <div className={`text-right ${product.inventory <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                                        <p className="text-sm font-bold">{product.inventory}</p>
                                        <p className="text-xs">{product.unit}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <p className="text-sm">All stock levels healthy</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                        <Link href="/admin/products" className="block w-full text-center text-sm font-semibold text-meat-600 hover:text-meat-700">
                            View All Products
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                        {orders.length > 0 ? (
                            orders.slice(0, 5).map((order: any) => (
                                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                        {order.buyer?.first_name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {order.buyer?.first_name} {order.buyer?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
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
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                <p className="text-sm">No orders yet</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                        <Link href="/admin/orders" className="block w-full text-center text-sm font-semibold text-meat-600 hover:text-meat-700">
                            View All Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Manage Users</p>
                            <p className="text-xs text-gray-500">{platformStats?.totalUsers || 0} total</p>
                        </div>
                    </Link>

                    <Link href="/admin/merchants" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Approve Sellers</p>
                            <p className="text-xs text-gray-500">{platformStats?.pendingVerifications || 0} pending</p>
                        </div>
                    </Link>

                    <Link href="/admin/products" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">View Products</p>
                            <p className="text-xs text-gray-500">{productStats?.activeProducts || 0} active</p>
                        </div>
                    </Link>

                    <Link href="/admin/orders" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 transition-all group">
                        <div className="bg-rose-100 p-2 rounded-lg text-rose-600 group-hover:bg-rose-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Process Orders</p>
                            <p className="text-xs text-gray-500">{pendingOrders} pending</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
