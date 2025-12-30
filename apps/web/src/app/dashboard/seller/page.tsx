'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { usersApi, ordersApi, groupsApi } from '@/lib/api';

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

export default function SellerDashboardPage() {
    const user = useAuthStore((state) => state.user);

    // Fetch seller stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['seller-stats', user?.id],
        queryFn: () => usersApi.getSellerStats(user!.id),
        enabled: !!user?.id,
    });

    // Fetch recent orders
    const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: () => ordersApi.getSellerOrders(user!.id),
        enabled: !!user?.id,
    });

    // Fetch active groups
    const { data: groups = [], isLoading: groupsLoading } = useQuery({
        queryKey: ['seller-groups', user?.id],
        queryFn: () => groupsApi.getSellerGroups(user!.id),
        enabled: !!user?.id,
    });

    const activeGroups = groups.filter((g: any) => g.status === 'ACTIVE');
    const isLoading = statsLoading || ordersLoading || groupsLoading;

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
                            title="Total Revenue"
                            value={`$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            icon={CurrencyDollarIcon}
                            trend={stats?.revenueTrend !== undefined ? `${stats.revenueTrend >= 0 ? '+' : ''}${stats.revenueTrend}% from last month` : undefined}
                            trendUp={stats?.revenueTrend !== undefined ? stats.revenueTrend >= 0 : undefined}
                        />
                        <StatCard
                            title="Active Group Buys"
                            value={String(stats?.activeGroups || activeGroups.length || 0)}
                            icon={TrendingUpIcon}
                        />
                        <StatCard
                            title="Pending Orders"
                            value={String(stats?.pendingOrders || 0)}
                            icon={ShoppingCartIcon}
                            trend={stats?.pendingOrders && stats.pendingOrders > 0 ? "Needs attention" : undefined}
                            trendUp={false}
                        />
                        <StatCard
                            title="Total Products"
                            value={String(stats?.totalProducts || 0)}
                            icon={CubeIcon}
                        />
                    </>
                )}
            </div>

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
                            <div className="text-gray-400 mb-2">
                                <TrendingUpIcon className="w-12 h-12 mx-auto opacity-50" />
                            </div>
                            <p className="text-gray-500 text-sm">No active group purchases yet</p>
                            <Link
                                href="/groups/create"
                                className="inline-block mt-3 text-meat-600 text-sm font-medium hover:text-meat-700"
                            >
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
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                        In Progress
                                    </span>
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
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                <ShoppingCartIcon className="w-12 h-12 mx-auto opacity-50" />
                            </div>
                            <p className="text-gray-500 text-sm">No orders yet</p>
                            <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers make purchases</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.slice(0, 5).map((order: any) => (
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
        </div>
    );
}
