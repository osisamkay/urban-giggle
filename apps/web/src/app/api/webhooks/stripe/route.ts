export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        // Update order status to CONFIRMED
        const { error } = await (supabaseAdmin as any)
          .from('orders')
          .update({
            status: 'CONFIRMED',
            payment_intent_id: paymentIntent.id,
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update order on payment success:', error);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed: ${paymentIntent.id}`);

        // 1. ATOMIC STATE TRANSITION
        // Only restore inventory if the order is still PENDING. 
        // This prevents "Inventory Inflation" via replay attacks.
        const { data: order, error: updateError } = await (supabaseAdmin as any)
          .from('orders')
          .update({ status: 'CANCELLED' })
          .eq('payment_intent_id', paymentIntent.id)
          .eq('status', 'PENDING') // Only update if it was pending
          .select()
          .single();

        if (updateError || !order) {
          console.log('Order already cancelled or not found. Skipping restoration.');
          break;
        }

        // 2. Restore Inventory (now safe because state changed from PENDING -> CANCELLED)
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', order.id);

        if (itemsError) {
          console.error('Failed to fetch items for restoration:', itemsError);
        } else if (items) {
            for (const item of items) {
              const { error: restoreError } = await (supabaseAdmin as any).rpc('restore_inventory', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              });
              if (restoreError) console.error(`Failed to restore item ${item.product_id}:`, restoreError);
            }
            console.log(`✅ Inventory restored for order ${order.id}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        console.log(`💰 Refund processed for: ${paymentIntentId}`);

        const { error } = await (supabaseAdmin as any)
          .from('orders')
          .update({ status: 'REFUNDED' })
          .eq('payment_intent_id', paymentIntentId);

        if (error) {
          console.error('Failed to update order on refund:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
