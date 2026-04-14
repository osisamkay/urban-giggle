import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface CreateOrderData {
  buyer_id: string;
  seller_id: string; // Required: ID of the seller (seller_profile.id)
  items: Array<{
    product_id: string;
    quantity: number;
    price_at_purchase: number;
  }>;
  shipping_address_id: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_intent_id?: string;
}

export const ordersApi = {
  // Create a new order
  createOrder: async (orderData: CreateOrderData) => {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create order');
    }

    return await response.json();
  },

  // Get user's orders
  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(
            title,
            images,
            unit
          )
        ),
        shipping_address:addresses(
          street,
          city,
          state,
          zip_code
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Get seller's orders
  getSellerOrders: async (userId: string) => {
    // First get seller_profile ID from user ID
    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users(
          first_name,
          last_name,
          email
        ),
        items:order_items(
          *,
          product:products(
            title,
            images
          )
        ),
        shipping_address:addresses(
          street,
          city,
          state,
          zip_code
        )
      `)
      .eq('seller_id', (profile as any).id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Get single order by ID
  getOrder: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users(
          first_name,
          last_name,
          email
        ),
        items:order_items(
          *,
          product:products(
            title,
            images,
            unit
          )
        ),
        shipping_address:addresses(
          street,
          city,
          state,
          zip_code,
          country
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data as any;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  ) => {
    const { data, error } = await supabase
      .from('orders')
      // @ts-ignore - Type issue with Supabase generated types
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Update tracking information
  updateTracking: async (orderId: string, trackingNumber: string, estimatedDelivery?: string) => {
    const updates: any = { tracking_number: trackingNumber };
    if (estimatedDelivery) {
      updates.estimated_delivery = estimatedDelivery;
    }

    const { data, error } = await supabase
      .from('orders')
      // @ts-ignore - Type issue with Supabase generated types
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },
  // Get ALL orders (Admin only)
  getAllOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
         items:order_items(
          *,
          product:products(
            title,
            images
          )
        ),
         buyer:users(
          email,
          first_name,
          last_name
        ),
        seller:seller_profiles(
          business_name
        ),
        shipping_address:addresses(
          street,
          city,
          state,
          zip_code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any;
  },

  // Get order stats for admin dashboard
  getOrderStats: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, total, created_at');

    if (error) throw error;

    const orders = data || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o: any) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const ordersToday = orders.filter((o: any) => new Date(o.created_at) >= today).length;
    const ordersThisWeek = orders.filter((o: any) => new Date(o.created_at) >= weekAgo).length;
    const ordersThisMonth = orders.filter((o: any) => new Date(o.created_at) >= monthAgo).length;

    const revenueThisWeek = orders
      .filter((o: any) => new Date(o.created_at) >= weekAgo && o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const statusBreakdown = {
      pending: orders.filter((o: any) => o.status === 'PENDING').length,
      confirmed: orders.filter((o: any) => o.status === 'CONFIRMED').length,
      processing: orders.filter((o: any) => o.status === 'PROCESSING').length,
      shipped: orders.filter((o: any) => o.status === 'SHIPPED').length,
      delivered: orders.filter((o: any) => o.status === 'DELIVERED').length,
      cancelled: orders.filter((o: any) => o.status === 'CANCELLED').length,
      refunded: orders.filter((o: any) => o.status === 'REFUNDED').length,
    };

    return {
      totalOrders,
      totalRevenue,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      revenueThisWeek,
      statusBreakdown,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  },

  // Bulk update order statuses
  bulkUpdateStatus: async (
    orderIds: string[],
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  ) => {
    const { data, error } = await supabase
      .from('orders')
      // @ts-ignore
      .update({ status })
      .in('id', orderIds)
      .select();

    if (error) throw error;
    return data as any;
  },
};
