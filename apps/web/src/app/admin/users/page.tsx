'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: usersApi.getAllUsers,
        enabled: !!user && user.role === 'ADMIN', // Only fetch when admin user is authenticated
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) =>
            usersApi.updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User role updated');
        },
        onError: () => toast.error('Failed to update role')
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load users</h3>
                <p className="text-gray-500 max-w-sm mb-6">There was an issue fetching user data. Please try again.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <div className="text-sm text-gray-500">
                    Total Users: {users.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold relative border border-slate-100">
                                                {user.avatar_url ? (
                                                    <Image src={user.avatar_url} alt="User" fill className="object-cover" />
                                                ) : (
                                                    <span>{user.first_name?.[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold
                                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'}
                                        `}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-meat-500 focus:ring-meat-500 py-1 pl-2 pr-8 bg-white"
                                            value={user.role}
                                            onChange={(e) => {
                                                const newRole = e.target.value;
                                                if (newRole !== user.role && confirm(`Change role for ${user.email} to ${newRole}?`)) {
                                                    updateRoleMutation.mutate({ userId: user.id, role: newRole });
                                                }
                                            }}
                                            disabled={updateRoleMutation.isPending}
                                        >
                                            <option value="BUYER">Buyer</option>
                                            <option value="SELLER">Seller</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
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
