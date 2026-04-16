import type { SupabaseClient } from '@supabase/supabase-js';
import type { SellerProfile, Product, ApiResponse, SalesAnalytics } from '@sharesteak/types';

export class SellerAPI {
  constructor(private supabase: SupabaseClient) {}

  async createSellerProfile(profile: {
    businessName: string;
    description?: string;
    location?: string;
  }): Promise<ApiResponse<SellerProfile>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
          business_name: profile.businessName,
          description: profile.description,
          location: profile.location,
        })
        .select()
        .single();

      if (error) throw error;

      // Update user role
      await this.supabase
        .from('users')
        .update({ role: 'SELLER' })
        .eq('id', user.id);

      return {
        success: true,
        data: data as SellerProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create seller profile',
        },
      };
    }
  }

  async getSellerProfile(): Promise<ApiResponse<SellerProfile | null>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return {
        success: true,
        data: data as SellerProfile | null,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch seller profile',
        },
      };
    }
  }

  async createProduct(product: {
    title: string;
    description: string;
    category: string;
    price: number;
    unit: string;
    inventory: number;
    images?: string[];
    specifications?: Record<string, string>;
    sourcingInfo?: Record<string, unknown>;
  }): Promise<ApiResponse<Product>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await this.supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Seller profile not found');

      const { data, error } = await this.supabase
        .from('products')
        .insert({
          seller_id: profile.id,
          ...product,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create product',
        },
      };
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Product,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update product',
        },
      };
    }
  }

  async getSellerOrders(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await this.supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Seller profile not found');

      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*)),
          buyer:users(id, first_name, last_name, email),
          shipping_address:addresses(*)
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch orders',
        },
      };
    }
  }

  async getAnalytics(): Promise<ApiResponse<SalesAnalytics>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await this.supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Seller profile not found');

      // This would typically be a database function or aggregation
      // For now, returning a basic structure
      const analytics: SalesAnalytics = {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
        revenueByPeriod: [],
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch analytics',
        },
      };
    }
  }
}
