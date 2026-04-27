export const dynamic = 'force-dynamic';
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

        // 1. Decrement Inventory FIRST (atomic — prevents race conditions)
        // Track which items were decremented so we can rollback on failure
        const decrementedItems: { product_id: string; quantity: number }[] = [];

        for (const item of items) {
            const { data: success, error: rpcError } = await (supabaseAdmin as any)
                .rpc('decrement_inventory', {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                });

            if (rpcError || !success) {
                // Rollback previously decremented inventory
                for (const dec of decrementedItems) {
                    await (supabaseAdmin as any).rpc('restore_inventory', {
                        p_product_id: dec.product_id,
                        p_quantity: dec.quantity,
                    }).catch((e: any) => console.error('Inventory rollback failed:', e));
                }
                return NextResponse.json(
                    { error: `Insufficient inventory for one or more products` },
                    { status: 409 }
                );
            }

            decrementedItems.push({ product_id: item.product_id, quantity: item.quantity });
        }

        // 2. Insert Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                ...orderFields,
                status: 'PENDING'
            } as any)
            .select()
            .single();

        if (orderError || !order) {
            console.error('Order insertion error:', orderError);
            // Rollback inventory
            for (const dec of decrementedItems) {
                await (supabaseAdmin as any).rpc('restore_inventory', {
                    p_product_id: dec.product_id,
                    p_quantity: dec.quantity,
                }).catch((e: any) => console.error('Inventory rollback failed:', e));
            }
            return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
        }

        // 3. Insert Order Items
        const orderItems = items.map((item: any) => ({
            order_id: (order as any).id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items insertion error:', itemsError);
            await supabaseAdmin.from('orders').delete().eq('id', (order as any).id);
            for (const dec of decrementedItems) {
                await (supabaseAdmin as any).rpc('restore_inventory', {
                    p_product_id: dec.product_id,
                    p_quantity: dec.quantity,
                }).catch((e: any) => console.error('Inventory rollback failed:', e));
            }
            return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
        }

        return NextResponse.json(order);
    } catch (e: any) {
        console.error('Create order exception:', e);
        return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
    }
}

// PATCH: Update order with payment_intent_id after payment confirmation
export async function PATCH(request: Request) {
    try {
        const authResult = await requireAuth();
        if ('error' in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { order_id, payment_intent_id } = await request.json();

        if (!order_id || !payment_intent_id) {
            return NextResponse.json({ error: 'order_id and payment_intent_id are required' }, { status: 400 });
        }

        // Verify the order belongs to this user
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('buyer_id')
            .eq('id', order_id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if ((order as any).buyer_id !== authResult.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error: updateError } = await (supabaseAdmin as any)
            .from('orders')
            .update({ payment_intent_id })
            .eq('id', order_id);

        if (updateError) {
            console.error('Order payment_intent_id update error:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('PATCH order exception:', e);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
