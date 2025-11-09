import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sellerId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT';
}

export const productsApi = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters) => {
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:seller_profiles(
          business_name,
          rating,
          verified,
          location
        )
      `)
      .eq('status', 'ACTIVE');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.sellerId) {
      query = query.eq('seller_id', filters.sellerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single product by ID
  getProduct: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:seller_profiles(
          business_name,
          rating,
          verified,
          location,
          description
        ),
        reviews(
          id,
          rating,
          title,
          comment,
          user_id,
          created_at,
          user:users(
            first_name,
            last_name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:seller_profiles(
          business_name,
          rating,
          verified
        )
      `)
      .eq('status', 'ACTIVE')
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get products by category
  getProductsByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:seller_profiles(
          business_name,
          rating,
          verified
        )
      `)
      .eq('category', category)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new product (seller only)
  createProduct: async (product: ProductInsert) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a product (seller only)
  updateProduct: async (id: string, updates: ProductUpdate) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a product (seller only)
  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get seller's products
  getSellerProducts: async (sellerId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
