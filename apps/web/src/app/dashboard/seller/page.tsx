'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { SimpleBarChart } from '@/components/dashboard/SimpleChart';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, groupsApi } from '@/lib/api';

// Icons
function CurrencyDollarIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function TrendingUpIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
}
function ShoppingCartIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function CubeIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}
function BadgeCheckIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ExclamationIcon(props: any) {
    return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}

export default function SellerDashboardPage() {
    const user = useAuthStore((state) => state.user);

    // Fetch seller analytics via API route (server-side RPC)
    const { data: analytics = {} as any, isLoading: analyticsLoading } = useQuery({
        queryKey: ['seller-analytics', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/seller/analytics?period=30_days');
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
        },
        enabled: !!user?.id,
    });

    // Fetch recent orders
    const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => ordersApi.getSellerOrders(user!.id),
        enabled: !!user?.id,
    });

    // Fetch active groups
    const { data: groupsRaw = [], isLoading: groupsLoading } = useQuery({
        queryKey: ['seller-groups', user?.id],
        queryFn: async () => groupsApi.getSellerGroups(user!.id),
        enabled: !!user?.id,
    });

    const activeGroups = (groupsRaw as any[]).filter((g: any) => g.status === 'ACTIVE');
    const isLoading = analyticsLoading || ordersLoading || groupsLoading;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Seller Overview</h1>
                <Link
                    href="/groups/create"
                    className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 shadow-sm"
                >
                    + New Group Buy
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total Revenue (30 Days)"
                            value={`$${Number(analytics.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            icon={CurrencyDollarIcon}
                        />
                        <StatCard
                            title="Total Orders (30 Days)"
                            value={String(analytics.total_orders || 0)}
                            icon={ShoppingCartIcon}
                        />
                        <StatCard
                            title="Fulfilled Orders"
                            value={String(analytics.fulfilled_orders || 0)}
                            icon={BadgeCheckIcon}
                        />
                        <StatCard
                            title="Pending Orders"
                            value={String(analytics.pending_orders || 0)}
                            icon={ExclamationIcon}
                            trend={analytics.pending_orders > 0 ? "Needs attention" : undefined}
                            trendUp={false}
                        />
                    </>
                )}
            </div>

            {/* Revenue by Period Chart */}
            {!isLoading && analytics.revenue_by_period && analytics.revenue_by_period.length > 0 && (
                <div className="mb-8">
                    <SimpleBarChart
                        title="Revenue Trend (30 Days)"
                        data={analytics.revenue_by_period.map((item: any) => ({
                            label: item.period,
                            value: Number(item.revenue),
                        }))}
                        color="#10b981"
                        formatValue={(v) => `$${v.toFixed(2)}`}
                    />
                </div>
            )}

            {/* Top Products */}
            {!isLoading && analytics.top_products && analytics.top_products.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Top 5 Products by Revenue</h2>
                        <div className="space-y-4">
                            {analytics.top_products.map((product: any, idx: number) => (
                                <div key={product.product_id || idx} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{product.product_title}</p>
                                        <p className="text-sm text-gray-500">{product.units_sold} units sold</p>
                                    </div>
                                    <p className="font-bold text-meat-600">${Number(product.product_revenue).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity / Active Groups */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Active Group Purchases</h2>
                    {groupsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : activeGroups.length === 0 ? (
                        <div className="text-center py-8">
                            <TrendingUpIcon className="w-12 h-12 mx-auto opacity-50 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">No active group purchases yet</p>
                            <Link href="/groups/create" className="inline-block mt-3 text-meat-600 text-sm font-medium hover:text-meat-700">
                                Create your first group buy →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeGroups.slice(0, 3).map((group: any) => (
                                <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{group.title}</p>
                                        <p className="text-sm text-gray-500">
                                            Target: {group.target_quantity} • {group.current_quantity || 0} Sold
                                        </p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">In Progress</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/dashboard/seller/groups" className="block text-center text-meat-600 text-sm font-medium mt-4 hover:text-meat-700">
                        View All Groups
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
                    {ordersLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 border-b border-gray-100 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (recentOrders as any[]).length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCartIcon className="w-12 h-12 mx-auto opacity-50 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">No orders yet</p>
                            <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers make purchases</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {(recentOrders as any[]).slice(0, 5).map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">
                                            {order.buyer?.first_name?.[0] || 'U'}{order.buyer?.last_name?.[0] || ''}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-sm text-gray-500 capitalize">{order.status?.toLowerCase().replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900">${order.total?.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/dashboard/seller/orders" className="block text-center text-meat-600 text-sm font-medium mt-4 hover:text-meat-700">
                        View All Orders
                    </Link>
                </div>
            </div>

            {/* No data placeholder */}
            {!isLoading && (!analytics.top_products || analytics.top_products.length === 0) && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
                    <CubeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 opacity-50" />
                    <p className="text-gray-500 text-sm">No product sales data yet</p>
                    <p className="text-gray-400 text-xs mt-1">Sales data will appear here once customers place orders</p>
                </div>
            )}
        </div>
    );
}
