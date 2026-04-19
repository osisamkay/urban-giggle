import { createClient } from '@supabase/supabase-js';

export interface Shipment {
  id: string;
  order_id: string;
  tracking_number?: string;
  carrier?: string;
  shipping_status: string;
  label_url?: string;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface ShippingLabelRequest {
  orderId: string;
  weightKg: number;
  destinationAddress: {
    street1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export class LogisticsAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Requests a shipping label for a specific order.
   * This triggers the server-side integration with the Shipping Provider.
   */
  async createShippingLabel(request: ShippingLabelRequest) {
    const response = await fetch('/api/logistics/create-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to generate shipping label');
    
    return response.json() as Promise<{ labelUrl: string; trackingNumber: string }>;
  }

  /**
   * Fetch shipment status for a specific order
   */
  async getShipmentStatus(orderId: string): Promise<Shipment | null> {
    const { data, error } = await this.supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Sync shipment status with the carrier (Triggered via webhook or manual pull)
   */
  async syncShipmentStatus(shipmentId: string) {
    const response = await fetch(`/api/logistics/sync/${shipmentId}`, {
      method: 'POST',
    });
    return response.json();
  }
}
