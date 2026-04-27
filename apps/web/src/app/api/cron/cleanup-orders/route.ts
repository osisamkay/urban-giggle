export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    // Security: Validate Cron Secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Running Ghost Inventory Reaper...');

    // 1. Find PENDING orders older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Use a subquery or separate step to ensure we only pick PENDING orders
    const { data: expiredOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('status', 'PENDING')
      .lt('created_at', oneHourAgo);

    if (fetchError) throw fetchError;

    if (!expiredOrders || expiredOrders.length === 0) {
      return NextResponse.json({ message: 'No expired orders found.' });
    }

    let restoredCount = 0;

    for (const order of expiredOrders as any[]) {
      // ATOMIC STATE TRANSITION: Mark as EXPIRED only if it is still PENDING
      const { data: updatedOrder, error: updateError } = await (supabaseAdmin as any)
        .from('orders')
        .update({ status: 'EXPIRED' })
        .eq('id', order.id)
        .eq('status', 'PENDING')
        .select()
        .single();

      if (updateError || !updatedOrder) continue; // Already processed by webhook or another reaper run

      // 2. Get items for this order
      const { data: items, error: itemsError } = await (supabaseAdmin as any)
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order.id);

      if (itemsError) {
        console.error(`Failed to fetch items for order ${order.id}:`, itemsError);
        continue;
      }

      // 3. Restore inventory for each item
      if (items) {
        for (const item of items) {
          await (supabaseAdmin as any).rpc('restore_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          }).catch((e: any) => console.error(`Reaper fail on ${item.product_id}:`, e));
        }
        restoredCount++;
      }
    }

    return NextResponse.json({ 
      message: `Reaper complete. Restored inventory for ${restoredCount} orders.`,
      count: restoredCount 
    });

  } catch (err: any) {
    console.error('Reaper Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
