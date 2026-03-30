import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 orders per minute per IP
        const rateLimitResponse = checkRateLimit(request, { maxRequests: 5, windowMs: 60_000 });
        if (rateLimitResponse) return rateLimitResponse;

        // Verify authentication
        const authResult = await requireAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const orderData = await request.json();

        // Verify the buyer_id matches the authenticated user
        if (orderData.buyer_id !== authResult.user.id) {
            return NextResponse.json(
                { error: 'Forbidden - Cannot create order for another user' },
                { status: 403 }
            );
        }

        // Validate seller_id is provided
        if (!orderData.seller_id) {
            return NextResponse.json(
                { error: 'seller_id is required' },
                { status: 400 }
            );
        }

        // Extract items for separate processing
        const { items, ...orderFields } = orderData;

        // 1. Insert Order
        // @ts-ignore - Supabase type mismatch potential
        const { data: orderDataRaw, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                ...orderFields,
                status: 'PENDING'
            })
            .select()
            .single();

        const order = orderDataRaw as any;

        if (orderError || !order) {
            console.error('Order insertion error:', orderError);
            return NextResponse.json({ error: orderError?.message || 'Failed to insert order' }, { status: 500 });
        }

        // 2. Insert Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items insertion error:', itemsError);
            // Ideally rollback order here?
            await supabaseAdmin.from('orders').delete().eq('id', order.id);
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }

        // 3. Decrement Inventory (atomic — prevents race conditions)
        for (const item of items) {
            const { data: success, error: rpcError } = await (supabaseAdmin as any)
                .rpc('decrement_inventory', {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                });

            if (rpcError || !success) {
                // Rollback: delete order and items if inventory insufficient
                await supabaseAdmin.from('order_items').delete().eq('order_id', order.id);
                await supabaseAdmin.from('orders').delete().eq('id', order.id);
                return NextResponse.json(
                    { error: `Insufficient inventory for product ${item.product_id}` },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(order);
    } catch (e: any) {
        console.error('Create order exception:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}
