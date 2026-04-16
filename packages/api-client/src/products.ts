import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductCategory, ApiResponse, PaginatedResponse } from '@sharesteak/types';

export class ProductsAPI {
  constructor(private supabase: SupabaseClient) {}

  async getProducts(params?: {
    category?: ProductCategory;
    sellerId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.supabase
        .from('products')
        .select('*, seller:seller_profiles(*)', { count: 'exact' })
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (params?.category) {
        query = query.eq('category', params.category);
      }

      if (params?.sellerId) {
        query = query.eq('seller_id', params.sellerId);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: {
          items: data as Product[],
          page,
          limit,
          total: count || 0,
          hasMore: offset + limit < (count || 0),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch products',
        },
      };
    }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*, seller:seller_profiles(*)')
        .eq('id', id)
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
          message: error instanceof Error ? error.message : 'Failed to fetch product',
        },
      };
    }
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*, seller:seller_profiles(*)')
        .eq('status', 'ACTIVE')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      return {
        success: true,
        data: data as Product[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to search products',
        },
      };
    }
  }
}
