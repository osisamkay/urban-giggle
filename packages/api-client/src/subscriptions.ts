import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_price: number;
  value_limit: number;
  features: any;
}

export class SubscriptionAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Fetch all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Create a checkout session for upgrading a seller's tier
   */
  async createUpgradeSession(planId: string) {
    // 1. Fetch plan details
    const { data: plan } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) throw new Error('Plan not found');

    // 2. Create Stripe Checkout Session for a recurring subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `Upgrade to ${plan.name} for enhanced seller capabilities`,
            },
            unit_amount: Math.round(plan.monthly_price * 100),
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/seller/verify?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/seller/verify?status=cancelled`,
      metadata: {
        planId: plan.id,
      },
    });

    return { url: session.url };
  }
}
