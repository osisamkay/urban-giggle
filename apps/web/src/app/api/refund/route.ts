import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { orderId, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    // Fetch order
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .select('*, seller:seller_profiles(user_id)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only the seller, buyer, or admin can refund
    const isBuyer = order.buyer_id === authResult.user.id;
    const isSeller = (order.seller as any)?.user_id === authResult.user.id;
    const isAdmin = authResult.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only refund confirmed/processing/shipped orders
    const refundableStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED'];
    if (!refundableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot refund order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // Process Stripe refund if payment exists
    if (order.payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: order.payment_intent_id,
          reason: 'requested_by_customer',
        });
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        return NextResponse.json(
          { error: `Refund failed: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // Update order status
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update({
        status: 'REFUNDED',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Restore inventory atomically using RPC
    const { data: orderItems } = await (supabaseAdmin as any)
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (orderItems) {
      for (const item of orderItems) {
        const { error: rpcError } = await (supabaseAdmin as any)
          .rpc('restore_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });

        if (rpcError) {
          console.error(`Failed to restore inventory for product ${item.product_id}:`, rpcError);
          // Continue restoring other items even if one fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order refunded successfully',
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
