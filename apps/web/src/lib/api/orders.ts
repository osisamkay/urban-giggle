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
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: orderData.buyer_id,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        shipping_address_id: orderData.shipping_address_id,
        status: 'PENDING',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
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
    return data;
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
    return data;
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
    return data;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  ) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update tracking information
  updateTracking: async (orderId: string, trackingNumber: string, estimatedDelivery?: string) => {
    const updates: any = { tracking_number: trackingNumber };
    if (estimatedDelivery) {
      updates.estimated_delivery = estimatedDelivery;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
