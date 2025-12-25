'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/groups';
import { useAuthStore } from '@/store/authStore';

export default function SellerGroupsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: groups, isLoading } = useQuery({
        queryKey: ['seller-groups', user?.id],
        queryFn: () => groupsApi.getSellerGroups(user!.id),
        enabled: !!user?.id
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-meat-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Group Buys</h1>
                <Link
                    href="/groups/create"
                    className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 shadow-sm transition-colors"
                >
                    + New Group Buy
                </Link>
            </div>

            {!groups || groups.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No group buys yet</h3>
                    <p className="text-gray-500 mb-6">Create your first group buy to start selling shares.</p>
                    <Link
                        href="/groups/create"
                        className="text-meat-600 font-medium hover:text-meat-700 underline"
                    >
                        Create Group Buy
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {groups.map((group: any) => (
                        <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                {group.product?.images?.[0] ? (
                                    <Image
                                        src={group.product.images[0]}
                                        alt={group.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{group.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            Created on {new Date(group.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            group.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {group.status}
                                    </span>
                                </div>

                                <div className="my-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-medium text-meat-700">
                                            {group.current_quantity} / {group.target_quantity} {group.product?.unit}s
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-meat-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(100, (group.current_quantity / group.target_quantity) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Link
                                        href={`/dashboard/seller/groups/${group.id}`}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        Manage Group
                                    </Link>
                                    <Link
                                        href={`/groups/${group.id}`}
                                        className="px-4 py-2 border border-transparent text-sm font-medium text-meat-600 hover:text-meat-700 hover:underline"
                                    >
                                        View Public Page
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
