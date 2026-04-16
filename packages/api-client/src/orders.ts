import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem, OrderStatus, ApiResponse } from '@sharesteak/types';

export class OrdersAPI {
  constructor(private supabase: SupabaseClient) {}

  async createOrder(order: {
    sellerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    shippingAddressId: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }): Promise<ApiResponse<Order>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create order
      const { data: orderData, error: orderError } = await this.supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: order.sellerId,
          shipping_address_id: order.shippingAddressId,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          status: 'PENDING',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return {
        success: true,
        data: orderData as Order,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create order',
        },
      };
    }
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*)),
          shipping_address:addresses(*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Order[],
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

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*, product:products(*)),
          shipping_address:addresses(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Order,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch order',
        },
      };
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as Order,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update order',
        },
      };
    }
  }
}
