import { createClient } from '@supabase/supabase-js';

export interface Dispute {
  id: string;
  order_id: string;
  reason: string;
  evidence_url?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolution?: string;
}

export interface ReferralStats {
  total_referrals: number;
  rewards_claimed: number;
  referral_code: string;
}

export class TrustAndGrowthAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Submit a dispute for a specific order
   */
  async createDispute(disputeData: { order_id: string; reason: string; evidence_url?: string }) {
    const { data, error } = await this.supabase
      .from('disputes')
      .insert([
        { 
          ...disputeData, 
          user_id: (await this.getCurrentUser()).id 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get the current user's referral statistics
   */
  async getReferralStats(): Promise<ReferralStats> {
    const user = await this.getCurrentUser();
    const { count } = await this.supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id);

    const { data: claimed } = await this.supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('referrer_id', user.id)
      .eq('reward_claimed', true);

    return {
      total_referrals: count || 0,
      rewards_claimed: claimed?.length || 0,
      referral_code: `SHARE-${user.id.slice(0, 8).toUpperCase()}`,
    };
  }

  private async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  }
}
