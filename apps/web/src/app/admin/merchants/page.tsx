'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AdminMerchantsPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { data: merchants = [], isLoading, isError } = useQuery({
        queryKey: ['admin-merchants'],
        queryFn: usersApi.getAllMerchants,
        enabled: !!user && user.role === 'ADMIN',
    });

    const verifyMutation = useMutation({
        mutationFn: ({ id, verified }: { id: string, verified: boolean }) =>
            usersApi.verifyMerchant(id, verified),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
            toast.success('Merchant status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Merchants...</div>;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load merchants</h3>
                <p className="text-gray-500 max-w-sm mb-6">There was an issue fetching merchant data. Please try again.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Business</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {merchants.map((merchant: any) => {
                                const profile = merchant.seller_profiles?.[0]; // Handle array return from join
                                if (!profile) return null;

                                return (
                                    <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {profile.business_name || 'N/A'}
                                            <div className="text-xs text-gray-400 font-normal">{profile.description?.slice(0, 30)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{merchant.first_name} {merchant.last_name}</span>
                                                <span className="text-gray-500 text-xs">{merchant.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{profile.location || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {profile.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: profile.id, verified: !profile.verified })}
                                                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${profile.verified ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                            >
                                                {profile.verified ? 'Deactivate' : 'Approve'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {merchants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No merchants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
