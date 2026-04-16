'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Pagination, paginateItems } from '@/components/ui/Pagination';

type MerchantWithStats = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    seller_profiles: Array<{
        id: string;
        business_name: string;
        description: string;
        location: string;
        verified: boolean;
        rating: number;
        total_sales: number;
        logo_url: string;
        certifications: string[];
    }>;
    stats?: {
        totalProducts: number;
        activeProducts: number;
        totalOrders: number;
        completedOrders: number;
        totalRevenue: number;
    };
};

type FilterStatus = 'all' | 'verified' | 'pending';
type SortOption = 'newest' | 'oldest' | 'rating' | 'sales' | 'name';

const PAGE_SIZE = 10;

export default function AdminMerchantsPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // State for search, filter, sort
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithStats | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        email: '',
        businessName: '',
        firstName: '',
        lastName: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch merchants with stats
    const { data: merchants = [], isLoading, isError } = useQuery({
        queryKey: ['admin-merchants-with-stats'],
        queryFn: usersApi.getMerchantsWithStats,
        enabled: !!user && user.role === 'ADMIN',
    });

    // Fetch merchant stats for cards
    const { data: stats } = useQuery({
        queryKey: ['admin-merchant-stats'],
        queryFn: usersApi.getMerchantStats,
        enabled: !!user && user.role === 'ADMIN',
    });

    // Verify mutation
    const verifyMutation = useMutation({
        mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
            usersApi.verifyMerchant(id, verified),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-merchants-with-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-merchant-stats'] });
            toast.success('Merchant status updated');
        },
        onError: () => toast.error('Failed to update status'),
    });

    // Invite merchant mutation
    const inviteMutation = useMutation({
        mutationFn: async (data: typeof inviteForm) => {
            const response = await fetch('/api/invite-merchant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to send invitation');
            return result;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Invitation sent successfully!');
            setIsInviteModalOpen(false);
            setInviteForm({ email: '', businessName: '', firstName: '', lastName: '' });
        },
        onError: (error: any) => toast.error(error.message || 'Failed to send invitation'),
    });

    // Filter and sort merchants
    const filteredMerchants = useMemo(() => {
        let result = [...merchants];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((m: MerchantWithStats) => {
                const profile = m.seller_profiles?.[0];
                return (
                    m.email?.toLowerCase().includes(query) ||
                    m.first_name?.toLowerCase().includes(query) ||
                    m.last_name?.toLowerCase().includes(query) ||
                    profile?.business_name?.toLowerCase().includes(query) ||
                    profile?.location?.toLowerCase().includes(query)
                );
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter((m: MerchantWithStats) => {
                const profile = m.seller_profiles?.[0];
                if (statusFilter === 'verified') return profile?.verified;
                if (statusFilter === 'pending') return !profile?.verified;
                return true;
            });
        }

        // Apply sorting
        result.sort((a: MerchantWithStats, b: MerchantWithStats) => {
            const profileA = a.seller_profiles?.[0];
            const profileB = b.seller_profiles?.[0];

            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'rating':
                    return (profileB?.rating || 0) - (profileA?.rating || 0);
                case 'sales':
                    return (profileB?.total_sales || 0) - (profileA?.total_sales || 0);
                case 'name':
                    return (profileA?.business_name || '').localeCompare(profileB?.business_name || '');
                default:
                    return 0;
            }
        });

        return result;
    }, [merchants, searchQuery, statusFilter, sortBy]);

    // Paginate the filtered merchants
    const { items: paginatedMerchants, totalPages, totalItems } = useMemo(() => {
        return paginateItems(filteredMerchants, currentPage, PAGE_SIZE);
    }, [filteredMerchants, currentPage]);

    // Reset to first page when filters change
    const handleFilterChange = (filter: FilterStatus) => {
        setStatusFilter(filter);
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const openMerchantDetails = (merchant: MerchantWithStats) => {
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading merchants...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and monitor all platform merchants</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Invite Merchant
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Merchants</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalMerchants || 0}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Verified</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats?.verifiedMerchants || 0}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats?.pendingMerchants || 0}</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">New This Month</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.newThisMonth || 0}</p>
                        </div>
                        <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-100">Total Platform Sales</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalPlatformSales || 0)}</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-100">Average Rating</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-2xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</p>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-5 h-5 ${star <= Math.round(stats?.averageRating || 0) ? 'text-white' : 'text-amber-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by business name, owner, email, or location..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {(['all', 'verified', 'pending'] as FilterStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleFilterChange(status)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="rating">Highest Rating</option>
                            <option value="sales">Most Sales</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Merchants Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Merchant</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedMerchants.map((merchant: MerchantWithStats) => {
                                const profile = merchant.seller_profiles?.[0];
                                if (!profile) return null;

                                return (
                                    <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {profile.business_name?.charAt(0) || 'M'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{profile.business_name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{profile.location || 'No location'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{merchant.first_name} {merchant.last_name}</p>
                                                <p className="text-xs text-gray-500">{merchant.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                                key={star}
                                                                className={`w-3.5 h-3.5 ${star <= Math.round(profile.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">({profile.rating?.toFixed(1) || '0.0'})</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{merchant.stats?.totalProducts || 0} products</span>
                                                    <span>{merchant.stats?.totalOrders || 0} orders</span>
                                                </div>
                                                <p className="text-xs font-medium text-green-600">
                                                    {formatCurrency(merchant.stats?.totalRevenue || 0)} revenue
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${profile.verified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${profile.verified ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}></span>
                                                {profile.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDate(merchant.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openMerchantDetails(merchant)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => verifyMutation.mutate({ id: profile.id, verified: !profile.verified })}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${profile.verified
                                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {profile.verified ? 'Suspend' : 'Approve'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredMerchants.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-medium">No merchants found</p>
                                            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                        pageSize={PAGE_SIZE}
                    />
                </div>
            </div>

            {/* Merchant Details Modal */}
            {isModalOpen && selectedMerchant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Merchant Details</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {(() => {
                                const profile = selectedMerchant.seller_profiles?.[0];
                                if (!profile) return <p>No profile data available</p>;

                                return (
                                    <>
                                        {/* Business Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                                {profile.business_name?.charAt(0) || 'M'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{profile.business_name}</h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${profile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {profile.verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-sm mt-1">{profile.location || 'No location specified'}</p>
                                                <p className="text-gray-600 text-sm mt-2">{profile.description || 'No description available'}</p>
                                            </div>
                                        </div>

                                        {/* Owner Info */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Owner Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-900">{selectedMerchant.first_name} {selectedMerchant.last_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="font-medium text-gray-900">{selectedMerchant.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Joined</p>
                                                    <p className="font-medium text-gray-900">{formatDate(selectedMerchant.created_at)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Rating</p>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= Math.round(profile.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                        <span className="text-sm text-gray-600 ml-1">({profile.rating?.toFixed(1) || '0.0'})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Stats */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                                    <p className="text-2xl font-bold text-blue-600">{selectedMerchant.stats?.totalProducts || 0}</p>
                                                    <p className="text-xs text-blue-600">Products</p>
                                                </div>
                                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                                    <p className="text-2xl font-bold text-green-600">{selectedMerchant.stats?.activeProducts || 0}</p>
                                                    <p className="text-xs text-green-600">Active</p>
                                                </div>
                                                <div className="bg-purple-50 rounded-xl p-3 text-center">
                                                    <p className="text-2xl font-bold text-purple-600">{selectedMerchant.stats?.totalOrders || 0}</p>
                                                    <p className="text-xs text-purple-600">Orders</p>
                                                </div>
                                                <div className="bg-amber-50 rounded-xl p-3 text-center">
                                                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedMerchant.stats?.totalRevenue || 0)}</p>
                                                    <p className="text-xs text-amber-600">Revenue</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        {profile.certifications && profile.certifications.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Certifications</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.certifications.map((cert: string, index: number) => (
                                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {cert}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                            <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Contact
                                            </button>
                                            <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                View Products
                                            </button>
                                            <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                View Orders
                                            </button>
                                            <button
                                                onClick={() => {
                                                    verifyMutation.mutate({ id: profile.id, verified: !profile.verified });
                                                    setIsModalOpen(false);
                                                }}
                                                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors ${profile.verified
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {profile.verified ? 'Suspend Merchant' : 'Approve Merchant'}
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Merchant Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Invite Merchant</h2>
                                <p className="text-sm text-gray-500 mt-1">Send an invitation to join as a seller</p>
                            </div>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                inviteMutation.mutate(inviteForm);
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="merchant@example.com"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={inviteForm.firstName}
                                        onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={inviteForm.lastName}
                                        onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    value={inviteForm.businessName}
                                    onChange={(e) => setInviteForm(prev => ({ ...prev, businessName: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Farm / Business Name"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">What happens next?</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            The merchant will receive an email invitation. When they click the link, they'll be able to set up their account and complete their seller profile.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteMutation.isPending}
                                    className="flex-1 py-2.5 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {inviteMutation.isPending ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Send Invitation
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
