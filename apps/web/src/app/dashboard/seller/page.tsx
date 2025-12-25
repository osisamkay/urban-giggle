'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import Link from 'next/link';

// Mock Icons
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
                <StatCard
                    title="Total Revenue"
                    value="$12,450"
                    icon={CurrencyDollarIcon}
                    trend="+12% from last month"
                    trendUp={true}
                />
                <StatCard
                    title="Active Group Buys"
                    value="3"
                    icon={TrendingUpIcon}
                />
                <StatCard
                    title="Pending Orders"
                    value="8"
                    icon={ShoppingCartIcon}
                    trend="Needs attention"
                    trendUp={false}
                />
                <StatCard
                    title="Total Products"
                    value="15"
                    icon={CubeIcon}
                />
            </div>

            {/* Recent Activity / Active Groups */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Active Group Purchases</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Grass-Fed Beef Share #{100 + i}</p>
                                    <p className="text-sm text-gray-500">Target: 16 Shares • 8 Sold</p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">In Progress</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/dashboard/seller/groups" className="block text-center text-meat-600 text-sm font-medium mt-4 hover:text-meat-700">
                        View All Groups
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order #{20240 + i}</p>
                                        <p className="text-sm text-gray-500">Quarter Beef Share</p>
                                    </div>
                                </div>
                                <p className="font-bold text-gray-900">$450.00</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/dashboard/seller/orders" className="block text-center text-meat-600 text-sm font-medium mt-4 hover:text-meat-700">
                        View All Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
