import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const authResult = await requireAuth();
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30_days';

        // Get seller profile ID for this user
        const { data: sellerProfile } = await supabaseAdmin
            .from('seller_profiles')
            .select('id')
            .eq('user_id', authResult.user.id)
            .single();

        if (!sellerProfile) {
            return NextResponse.json({
                total_revenue: 0,
                total_orders: 0,
                average_order_value: 0,
                fulfilled_orders: 0,
                pending_orders: 0,
                revenue_by_period: null,
                top_products: null,
            });
        }

        // Call the RPC function with the seller_profile ID
        const spId = (sellerProfile as any).id;
        const { data, error } = await (supabaseAdmin as any)
            .rpc('get_seller_analytics', {
                p_seller_id: spId,
                p_period: period,
            })
            .single();

        if (error) {
            console.error('Analytics RPC error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || {
            total_revenue: 0,
            total_orders: 0,
            average_order_value: 0,
            fulfilled_orders: 0,
            pending_orders: 0,
            revenue_by_period: null,
            top_products: null,
        });
    } catch (error: any) {
        console.error('Seller analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
