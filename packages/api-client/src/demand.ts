import { createClient } from '@supabase/supabase-js';

export interface DemandSignal {
  id?: string;
  user_id: string;
  product_category: string;
  requested_product_name: string;
  estimated_quantity: number;
  region?: string;
  created_at?: string;
}

export interface DemandSummary {
  requested_product_name: string;
  product_category: string;
  region: string;
  total_requests: number;
  total_requested_quantity: number;
  last_requested_at: string;
}

export class DemandAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Submit a demand signal (Request a product)
   */
  async submitDemand(signal: DemandSignal) {
    const { data, error } = await this.supabase
      .from('demand_signals')
      .insert([signal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get aggregated demand summary for sellers
   */
  async getDemandSummary(): Promise<DemandSummary[]> {
    const { data, error } = await this.supabase
      .from('seller_demand_summary')
      .select('*')
      .order('total_requests', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
