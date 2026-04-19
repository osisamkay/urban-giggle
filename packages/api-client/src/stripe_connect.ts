import { createClient } from '@supabase/supabase-js';

export interface StripeConnectResponse {
  url: string;
  accountId: string;
}

export class StripeConnectAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Generates a Stripe Connect onboarding link for the seller
   */
  async createOnboardingLink() {
    // In a production environment, this would call a server-side route 
    // that uses the Stripe Node SDK to create an 'express' account
    // and generate an Account Link.
    
    // For the purpose of this implementation, we are creating the API definition.
    // The actual Stripe SDK call happens in /api/seller/stripe/connect
    const response = await fetch('/api/seller/stripe/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to generate onboarding link');
    
    return response.json() as Promise<StripeConnectResponse>;
  }

  /**
   * Check if the seller is already connected
   */
  async checkConnectionStatus() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('stripe_account_id')
      .single();

    if (error) throw error;
    return data?.stripe_account_id ? { connected: true, accountId: data.stripe_account_id } : { connected: false };
  }
}
