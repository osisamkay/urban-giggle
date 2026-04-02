import { supabase } from '../supabase/client';

export const usersApi = {
    // Get platform stats for admin dashboard
    getPlatformStats: async () => {
        const [usersResult, sellersResult, pendingSellersResult] = await Promise.all([
            supabase.from('users').select('id, role, created_at'),
            supabase.from('seller_profiles').select('id, verified, created_at'),
            supabase.from('seller_profiles').select('id').eq('verified', false),
        ]);

        if (usersResult.error) throw usersResult.error;
        if (sellersResult.error) throw sellersResult.error;

        const users = usersResult.data || [];
        const sellers = sellersResult.data || [];
        const pendingSellers = pendingSellersResult.data || [];

        // Calculate stats
        const totalUsers = users.length;
        const totalSellers = sellers.filter((s: any) => s.verified).length;
        const pendingVerifications = pendingSellers.length;

        // Users this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newUsersThisWeek = users.filter((u: any) => new Date(u.created_at) > weekAgo).length;

        return {
            totalUsers,
            totalSellers,
            pendingVerifications,
            newUsersThisWeek,
        };
    },

    // Get pending seller verifications
    getPendingVerifications: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*, seller_profiles!inner(*)')
            .eq('role', 'SELLER')
            .eq('seller_profiles.verified', false)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        return data as any;
    },

    getAllUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return data as any;
    },

    updateUserRole: async (userId: string, role: string) => {
        const { data, error } = await supabase
            .from('users')
            // @ts-ignore
            .update({ role })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as any;
    },

    getAllMerchants: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*, seller_profiles(*)')
            .eq('role', 'SELLER')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any;
    },

    // Get merchants with extended stats (products, orders, revenue)
    getMerchantsWithStats: async () => {
        // Use API endpoint to bypass RLS
        const response = await fetch('/api/admin/merchants');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch merchants');
        }
        const data = await response.json();
        return data.merchants;
    },

    // Get merchant stats summary for dashboard cards
    getMerchantStats: async () => {
        // Use API endpoint to bypass RLS
        const response = await fetch('/api/admin/merchants/stats');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch merchant stats');
        }
        return response.json();
    },

    verifyMerchant: async (sellerProfileId: string, verified: boolean) => {
        const response = await fetch('/api/admin/merchants/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: sellerProfileId, verified }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to verify merchant');
        }
    },

    // Update seller profile (admin)
    updateSellerProfile: async (sellerProfileId: string, updates: {
        business_name?: string;
        description?: string;
        location?: string;
        certifications?: string[];
    }) => {
        const { data, error } = await supabase
            .from('seller_profiles')
            // @ts-ignore
            .update(updates)
            .eq('id', sellerProfileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};