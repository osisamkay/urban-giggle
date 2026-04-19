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
                order_status_breakdown: null,
                category_breakdown: null,
            });
        }

        const spId = (sellerProfile as any).id;

        // Call the main RPC function
        const { data: analyticsData, error: analyticsError } = await (supabaseAdmin as any)
            .rpc('get_seller_analytics', {
                p_seller_id: spId,
                p_period: period,
            })
            .single();

        if (analyticsError) {
            console.error('Analytics RPC error:', analyticsError);
            return NextResponse.json({ error: analyticsError.message }, { status: 500 });
        }

        // Get order status breakdown
        const { data: statusBreakdown } = await supabaseAdmin
            .from('orders')
            .select('status')
            .eq('seller_id', spId);

        const statusCounts: Record<string, number> = {};
        (statusBreakdown || []).forEach((o: any) => {
            const s = o.status as string;
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        // Get category breakdown from products
        const { data: categoryData } = await supabaseAdmin
            .from('products')
            .select('category')
            .eq('seller_id', spId)
            .eq('status', 'ACTIVE');

        const categoryCounts: Record<string, number> = {};
        (categoryData || []).forEach((p: any) => {
            const c = p.category as string;
            categoryCounts[c] = (categoryCounts[c] || 0) + 1;
        });

        // Get average order value
        const avgOrderValue = analyticsData?.total_orders > 0
            ? Number(analyticsData.total_revenue) / Number(analyticsData.total_orders)
            : 0;

        return NextResponse.json({
            ...analyticsData,
            average_order_value: avgOrderValue,
            order_status_breakdown: Object.entries(statusCounts).map(([status, count]) => ({
                status,
                count,
            })),
            category_breakdown: Object.entries(categoryCounts).map(([category, count]) => ({
                category,
                count,
            })),
        });
    } catch (error: any) {
        console.error('Seller analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
