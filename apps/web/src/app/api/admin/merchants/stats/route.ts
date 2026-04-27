export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server-auth';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '@/lib/supabase/config';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin-only API to fetch merchant stats summary
export async function GET(request: NextRequest) {
    try {
        // Verify admin user
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(getSupabaseUrl(), supabaseServiceKey, {
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

        // Get seller profiles
        const { data: profiles, error } = await supabaseAdmin
            .from('seller_profiles')
            .select('id, verified, rating, total_sales, created_at');

        if (error) {
            console.error('Seller profiles fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const sellers = profiles || [];
        const now = new Date();
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

        const stats = {
            totalMerchants: sellers.length,
            verifiedMerchants: sellers.filter((s: any) => s.verified).length,
            pendingMerchants: sellers.filter((s: any) => !s.verified).length,
            newThisMonth: sellers.filter((s: any) => new Date(s.created_at) > monthAgo).length,
            averageRating: sellers.length > 0
                ? sellers.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / sellers.length
                : 0,
            totalPlatformSales: sellers.reduce((sum: number, s: any) => sum + (s.total_sales || 0), 0),
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('Admin merchant stats API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
