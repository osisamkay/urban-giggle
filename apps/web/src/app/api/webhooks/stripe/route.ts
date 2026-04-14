import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
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

        // Update order status to CANCELLED
        const { error } = await (supabaseAdmin as any)
          .from('orders')
          .update({ status: 'CANCELLED' })
          .eq('payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update order on payment failure:', error);
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
