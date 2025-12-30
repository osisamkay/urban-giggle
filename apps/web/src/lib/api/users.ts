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
        // Get all sellers with profiles
        const { data: merchants, error: merchantError } = await supabase
            .from('users')
            .select('*, seller_profiles(*)')
            .eq('role', 'SELLER')
            .order('created_at', { ascending: false });

        if (merchantError) throw merchantError;

        // Get product counts per seller
        const { data: products, error: productError } = await supabase
            .from('products')
            .select('seller_id, status');

        if (productError) throw productError;

        // Get order stats per seller
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('seller_id, total, status');

        if (orderError) throw orderError;

        // Aggregate stats for each merchant
        const merchantsWithStats = (merchants || []).map((merchant: any) => {
            // Handle seller_profiles being either an array or a single object
            let profile = null;
            if (Array.isArray(merchant.seller_profiles)) {
                profile = merchant.seller_profiles[0];
            } else if (merchant.seller_profiles && typeof merchant.seller_profiles === 'object') {
                profile = merchant.seller_profiles;
            }
            if (!profile) return { ...merchant, seller_profiles: [], stats: null };

            const sellerProducts = (products || []).filter((p: any) => p.seller_id === profile.id);
            const sellerOrders = (orders || []).filter((o: any) => o.seller_id === profile.id);

            const stats = {
                totalProducts: sellerProducts.length,
                activeProducts: sellerProducts.filter((p: any) => p.status === 'ACTIVE').length,
                totalOrders: sellerOrders.length,
                completedOrders: sellerOrders.filter((o: any) => o.status === 'DELIVERED').length,
                totalRevenue: sellerOrders
                    .filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
                    .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
            };

            return { ...merchant, seller_profiles: [profile], stats };
        });

        return merchantsWithStats;
    },

    // Get merchant stats summary for dashboard cards
    getMerchantStats: async () => {
        const { data: profiles, error } = await supabase
            .from('seller_profiles')
            .select('id, verified, rating, total_sales, created_at');

        if (error) throw error;

        const sellers = profiles || [];
        const now = new Date();
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

        return {
            totalMerchants: sellers.length,
            verifiedMerchants: sellers.filter((s: any) => s.verified).length,
            pendingMerchants: sellers.filter((s: any) => !s.verified).length,
            newThisMonth: sellers.filter((s: any) => new Date(s.created_at) > monthAgo).length,
            averageRating: sellers.length > 0
                ? sellers.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / sellers.length
                : 0,
            totalPlatformSales: sellers.reduce((sum: number, s: any) => sum + (s.total_sales || 0), 0),
        };
    },

    verifyMerchant: async (sellerProfileId: string, verified: boolean) => {
        const { error } = await supabase
            .from('seller_profiles')
            // @ts-ignore
            .update({ verified })
            .eq('id', sellerProfileId);

        if (error) throw error;
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

    // Get seller dashboard stats
    getSellerStats: async (sellerId: string) => {
        // Get seller profile first to get the seller_profile id
        const { data: sellerProfile, error: profileError } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('user_id', sellerId)
            .single();

        if (profileError) throw profileError;
        if (!sellerProfile) throw new Error('Seller profile not found');

        const sellerProfileId = (sellerProfile as any).id;

        // Fetch all stats in parallel
        const [ordersResult, productsResult, groupsResult] = await Promise.all([
            // Get orders for this seller
            supabase
                .from('orders')
                .select('id, total, status, created_at')
                .eq('seller_id', sellerProfileId),
            // Get products for this seller
            supabase
                .from('products')
                .select('id, status')
                .eq('seller_id', sellerProfileId),
            // Get group purchases for this seller
            supabase
                .from('group_purchases')
                .select('id, status, current_quantity, target_quantity')
                .eq('organizer_id', sellerId),
        ]);

        const orders = ordersResult.data || [];
        const products = productsResult.data || [];
        const groups = groupsResult.data || [];

        // Calculate revenue (only from delivered orders)
        const totalRevenue = orders
            .filter((o: any) => o.status === 'DELIVERED')
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

        // Calculate this month's revenue
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const thisMonthRevenue = orders
            .filter((o: any) =>
                o.status === 'DELIVERED' &&
                new Date(o.created_at) >= thisMonth
            )
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

        const lastMonthRevenue = orders
            .filter((o: any) =>
                o.status === 'DELIVERED' &&
                new Date(o.created_at) >= lastMonth &&
                new Date(o.created_at) < thisMonth
            )
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

        // Calculate revenue trend
        const revenueTrend = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0)
            : thisMonthRevenue > 0 ? '+100' : '0';

        // Counts
        const pendingOrdersCount = orders.filter((o: any) =>
            o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING'
        ).length;

        const activeGroupsCount = groups.filter((g: any) => g.status === 'ACTIVE').length;
        const totalProductsCount = products.filter((p: any) => p.status === 'ACTIVE').length;

        // Get recent orders (last 5)
        const recentOrders = orders
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        return {
            totalRevenue,
            revenueTrend: parseInt(revenueTrend),
            pendingOrders: pendingOrdersCount,
            activeGroups: activeGroupsCount,
            totalProducts: totalProductsCount,
            recentOrders,
            activeGroupsList: groups.filter((g: any) => g.status === 'ACTIVE').slice(0, 3),
        };
    },
};
