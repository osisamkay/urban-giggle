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
      `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default to ACTIVE if not specified? 
      // Or should public API default to active?
      // Usually safer to default to ACTIVE for public.
      // Admin can pass 'any' or different status?
      // If I want "ALL", I need a way to say "no filter".
      // Maybe strict check for undefined?
      query = query.eq('status', 'ACTIVE');
    }

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
      // @ts-ignore - Type issue with Supabase generated types
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
      // @ts-ignore - Type issue with Supabase generated types
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

  getAdminProducts: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:seller_profiles(business_name, rating, verified)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Get product stats for admin dashboard
  getProductStats: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, status, inventory, category, created_at');

    if (error) throw error;

    const products = data || [];
    const totalProducts = products.length;
    const activeProducts = products.filter((p: any) => p.status === 'ACTIVE').length;
    const lowStockProducts = products.filter((p: any) => p.inventory <= 10 && p.status === 'ACTIVE');
    const outOfStockProducts = products.filter((p: any) => p.status === 'OUT_OF_STOCK').length;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    products.forEach((p: any) => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    return {
      totalProducts,
      activeProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockProducts,
      categoryBreakdown: categoryCount,
    };
  },

  // Get low stock products for admin alerts
  getLowStockProducts: async (threshold = 10) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, title, inventory, unit, status, images,
        seller:seller_profiles(business_name)
      `)
      .eq('status', 'ACTIVE')
      .lte('inventory', threshold)
      .order('inventory', { ascending: true })
      .limit(5);

    if (error) throw error;
    return data as any;
  },
};
