import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { groupId, userId, quantity } = await req.json();
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Fetch Group and Seller Details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*, profiles(stripe_account_id)')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const sellerStripeAccountId = group.profiles?.stripe_account_id;
    if (!sellerStripeAccountId) {
      return NextResponse.json({ error: 'Seller has not connected their payout account' }, { status: 400 });
    }

    // 2. Fetch Platform Fee Percentage
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'platform_fee_percentage')
      .single();

    const feePercentage = parseFloat(settings?.value || '5') / 100;
    const totalAmount = group.group_price * quantity;
    const applicationFeeAmount = Math.round(totalAmount * feePercentage);

    // 3. Create Stripe Checkout Session with Destination Charge
    // Using 'transfer_data' allows the platform to take a fee and send the rest to the connected account
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: group.product_name,
              description: `Collective purchase for ${quantity}kg`,
            },
            unit_amount: Math.round(group.group_price * 100), // in cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount, // Your profit
        transfer_data: {
          destination: sellerStripeAccountId, // Seller's profit
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groups?status=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
