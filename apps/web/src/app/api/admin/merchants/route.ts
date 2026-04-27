export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin-only API to fetch merchants with stats
export async function GET(request: NextRequest) {
    try {
        // Verify admin user
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Check if user is admin
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', authUser.id)
            .single();

        if (!userData || userData.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        // Get all sellers with profiles
        const { data: merchants, error: merchantError } = await supabaseAdmin
            .from('users')
            .select('*, seller_profiles(*)')
            .eq('role', 'SELLER')
            .order('created_at', { ascending: false });

        if (merchantError) {
            console.error('Merchant fetch error:', merchantError);
            return NextResponse.json({ error: merchantError.message }, { status: 500 });
        }

        // Get product counts per seller
        const { data: products, error: productError } = await supabaseAdmin
            .from('products')
            .select('seller_id, status');

        if (productError) {
            console.error('Products fetch error:', productError);
        }

        // Get order stats per seller
        const { data: orders, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('seller_id, total, status');

        if (orderError) {
            console.error('Orders fetch error:', orderError);
        }

        // Aggregate stats for each merchant
        const merchantsWithStats = (merchants || []).map((merchant: any) => {
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

        return NextResponse.json({ merchants: merchantsWithStats });
    } catch (error: any) {
        console.error('Admin merchants API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
