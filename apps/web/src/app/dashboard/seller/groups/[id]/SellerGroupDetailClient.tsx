'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api/groups';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Props {
    id: string;
}

export default function SellerGroupDetailClient({ id }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: group, isLoading } = useQuery({
        queryKey: ['group', id],
        queryFn: () => groupsApi.getGroup(id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED') =>
            groupsApi.updateGroupStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group', id] });
            toast.success('Group status updated');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update status');
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-meat-600 border-t-transparent" />
            </div>
        );
    }

    if (!group) {
        return <div>Group not found</div>;
    }

    const emails = group.participants?.map((p: any) => p.user?.email).filter(Boolean) || [];
    const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=Update: ${group.title}`;

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/dashboard/seller/groups" className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                group.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {group.status}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{group.title}</h1>
                </div>

                <div className="flex gap-3">
                    {group.status === 'ACTIVE' && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to close this group early? This will mark it as COMPLETED.')) {
                                    updateStatusMutation.mutate('COMPLETED');
                                }
                            }}
                            disabled={updateStatusMutation.isPending}
                            className="bg-meat-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-meat-700 shadow-sm disabled:opacity-50"
                        >
                            Close Group
                        </button>
                    )}
                    <a
                        href={mailtoLink}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                    >
                        Message Participants
                    </a>
                    <Link
                        href={`/dashboard/seller/groups/${id}/print`}
                        target="_blank"
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                    >
                        Print Packing List
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Total Sales</p>
                            <p className="text-xl font-bold text-gray-900">{group.current_quantity} {group.product?.unit}s</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Target</p>
                            <p className="text-xl font-bold text-gray-900">{group.target_quantity} {group.product?.unit}s</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Participants</p>
                            <p className="text-xl font-bold text-gray-900">{group.participant_count}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-500">Deadline</p>
                            <p className="text-lg font-bold text-gray-900">{new Date(group.deadline).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Participants & Orders</h2>
                        </div>
                        {!group.participants || group.participants.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No participants yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Quantity</th>
                                            <th className="px-6 py-3">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {group.participants.map((p: any) => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {p.user?.first_name} {p.user?.last_name}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {p.user?.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">
                                                    {p.quantity} {group.product?.unit}s
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(p.joined_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
                        <div className="aspect-video w-full relative rounded-lg overflow-hidden bg-gray-100 mb-4">
                            {group.product?.images?.[0] && (
                                <Image src={group.product.images[0]} alt={group.product.title} fill className="object-cover" />
                            )}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{group.product?.title}</h4>
                        <p className="text-sm text-gray-500 mb-4">{group.description}</p>
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Min Qty</span>
                                <span className="font-medium">{group.minimum_quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Unit</span>
                                <span className="font-medium">{group.product?.unit}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
