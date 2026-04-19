import React, { useEffect, useState } from 'react';
import { LogisticsAPI, Shipment } from '@urban-giggle/api-client';
import { Truck, PackageCheck, MapPin, ExternalLink } from 'lucide-react';

export default function OrderTrackingCard({ orderId }: { orderId: string }) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracking() {
      try {
        const api = new LogisticsAPI();
        const data = await api.getShipmentStatus(orderId);
        setShipment(data);
      } catch (err) {
        console.error('Tracking load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTracking();
  }, [orderId]);

  if (loading) return <div className="p-4 text-center text-zinc-500 animate-pulse">Loading shipment data...</div>;
  if (!shipment) return <div className="p-4 text-center text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl">Shipping label not yet created by seller.</div>;

  const statusColors: Record<string, string> = {
    'LABEL_CREATED': 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    'IN_TRANSIT': 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    'OUT_FOR_DELIVERY': 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    'DELIVERED': 'text-green-500 bg-green-100 dark:bg-green-900/30',
    'FAILED': 'text-red-500 bg-red-100 dark:bg-red-900/30',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Truck className="text-zinc-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Shipping Status</h3>
            <p className="text-zinc-500 text-sm">Carrier: {shipment.carrier || 'Pending'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[shipment.shipping_status] || 'bg-zinc-100'}`}>
          {shipment.shipping_status.replace('_', ' ')}
        </span>
      </div>

      <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        <div className="relative">
          <div className="absolute -left-6 top-0 p-1 bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 rounded-full">
            <PackageCheck size={12} className="text-zinc-400" />
          </div>
          <div className="text-sm font-bold">Order Processed</div>
          <div className="text-xs text-zinc-500">Label created by seller</div>
        </div>
        
        <div className={`relative ${shipment.shipping_status === 'IN_TRANSIT' || shipment.shipping_status === 'DELIVERED' ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`absolute -left-6 top-0 p-1 rounded-full border-2 ${shipment.shipping_status === 'DELIVERED' ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'}`}>
            <Truck size={12} className={shipment.shipping_status === 'DELIVERED' ? 'text-white' : 'text-zinc-400'} />
          </div>
          <div className="text-sm font-bold">In Transit</div>
          <div className="text-xs text-zinc-500">Package is moving through the network</div>
        </div>

        <div className={`relative ${shipment.shipping_status === 'DELIVERED' ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`absolute -left-6 top-0 p-1 rounded-full border-2 ${shipment.shipping_status === 'DELIVERED' ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700'}`}>
            <MapPin size={12} className={shipment.shipping_status === 'DELIVERED' ? 'text-white' : 'text-zinc-400'} />
          </div>
          <div className="text-sm font-bold">Delivered</div>
          <div className="text-xs text-zinc-500">Package arrived at destination</div>
        </div>
      </div>

      {shipment.tracking_number && (
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-zinc-500">Tracking ID: </span>
            <span className="font-mono font-bold">{shipment.tracking_number}</span>
          </div>
          <a 
            href={`https://www.google.com/search?q=${shipment.tracking_number}`} 
            target="_blank" 
            className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            Track Package <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
