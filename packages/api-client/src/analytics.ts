import { createClient } from '@supabase/supabase-js';

export interface GroupAnalytics {
  group_id: string;
  views: number;
  joins: number;
  revenue: number;
  status: string;
  conversion_rate: number; // Calculated: (joins / views) * 100
}

export interface RevenueData {
  day: string;
  daily_revenue: number;
  groups_filled: number;
}

export class AnalyticsAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Get conversion analytics for all groups owned by the seller
   */
  async getGroupConversion(): Promise<GroupAnalytics[]> {
    const { data, error } = await this.supabase
      .from('seller_analytics')
      .select('*, groups(product_name)');

    if (error) throw error;

    return (data || []).map((item: any) => ({
      group_id: item.group_id,
      views: item.views,
      joins: item.joins,
      revenue: item.revenue,
      status: item.status,
      conversion_rate: item.views > 0 ? (item.joins / item.views) * 100 : 0
    }));
  }

  /**
   * Get revenue velocity for the dashboard chart
   */
  async getRevenueVelocity(): Promise<RevenueData[]> {
    const { data, error } = await this.supabase
      .from('seller_revenue_velocity')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  /**
   * Manually update analytics (e.g. when a group is filled)
   */
  async updateAnalytics(groupId: string, updates: Partial<GroupAnalytics>) {
    const { data, error } = await this.supabase
      .from('seller_analytics')
      .update(updates)
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  }
}
