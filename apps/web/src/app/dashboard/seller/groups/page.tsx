'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { groupsApi } from '@/lib/api';

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    EXPIRED: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function SellerGroupsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: groups = [], isLoading } = useQuery({
        queryKey: ['seller-groups', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await groupsApi.getSellerGroups(user.id);
        },
        enabled: !!user?.id,
    });

    const activeGroups = (groups as any[]).filter((g: any) => g.status === 'ACTIVE');
    const pastGroups = (groups as any[]).filter((g: any) => g.status !== 'ACTIVE');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Group Purchases</h1>
                    <p className="text-sm text-gray-500 mt-1">{activeGroups.length} active, {pastGroups.length} completed</p>
                </div>
                <Link href="/groups/create" className="bg-[#2E4F4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#253F3F] transition-colors shadow-sm">
                    + New Group Buy
                </Link>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E4F4F] mx-auto" />
                    <p className="text-gray-500 mt-4 text-sm">Loading group purchases...</p>
                </div>
            ) : (groups as any[]).length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No group purchases yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create a group buy to offer bulk discounts and attract more customers.</p>
                    <Link href="/groups/create" className="inline-block bg-[#2E4F4F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#253F3F] transition-colors">
                        + Create Group Buy
                    </Link>
                </div>
            ) : (
                <>
                    {/* Active Groups */}
                    {activeGroups.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">🟢 Active Group Buys</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {activeGroups.map((group: any) => {
                                    const progress = group.target_quantity > 0
                                        ? Math.min(((group.current_quantity || 0) / group.target_quantity) * 100, 100)
                                        : 0;
                                    const daysLeft = Math.max(0, Math.ceil((new Date(group.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                                    return (
                                        <Link key={group.id} href={`/dashboard/seller/groups/${group.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-[#2E4F4F] transition-colors">{group.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{group.participant_count || 0} participants</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">{daysLeft}d left</span>
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[group.status]}`}>{group.status}</span>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                                                    <span>{group.current_quantity || 0} / {group.target_quantity} units</span>
                                                    <span className="font-medium">{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-[#3A5A5A] to-[#2E4F4F] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>

                                            {/* Price Tiers Preview */}
                                            {group.price_tiers && (
                                                <div className="flex gap-2 mt-3">
                                                    {(group.price_tiers as any[]).slice(0, 3).map((tier: any, idx: number) => (
                                                        <span key={idx} className={`text-xs px-2 py-1 rounded-lg ${
                                                            (group.current_quantity || 0) >= tier.minQuantity
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-gray-50 text-gray-500'
                                                        }`}>
                                                            {tier.minQuantity}+: ${tier.pricePerUnit}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Past Groups */}
                    {pastGroups.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Past Group Buys</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 py-4">Group</th>
                                            <th className="px-6 py-4">Progress</th>
                                            <th className="px-6 py-4">Participants</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pastGroups.map((group: any) => (
                                            <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{group.title}</td>
                                                <td className="px-6 py-4 text-gray-600">{group.current_quantity || 0} / {group.target_quantity}</td>
                                                <td className="px-6 py-4 text-gray-600">{group.participant_count || 0}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[group.status] || ''}`}>{group.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
