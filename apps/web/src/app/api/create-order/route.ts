import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
    try {
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

        // 3. Decrement Inventory
        const admin: any = supabaseAdmin;
        for (const item of items) {
            const { data: product } = await admin
                .from('products')
                .select('inventory, title')
                .eq('id', item.product_id)
                .single();

            if (product && typeof product.inventory === 'number') {
                const newInventory = Math.max(0, product.inventory - item.quantity);
                await admin
                    .from('products')
                    .update({ inventory: newInventory })
                    .eq('id', item.product_id);
            }
        }

        return NextResponse.json(order);
    } catch (e: any) {
        console.error('Create order exception:', e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}
