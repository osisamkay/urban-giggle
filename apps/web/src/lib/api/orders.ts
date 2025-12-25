import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface CreateOrderData {
  buyer_id: string;
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
  getSellerOrders: async (sellerId: string) => {
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
      .eq('seller_id', sellerId)
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
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as any;
  },
};
