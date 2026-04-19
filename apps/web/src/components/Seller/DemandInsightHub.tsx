import React, { useEffect, useState } from 'react';
import { DemandAPI, DemandSummary } from '@urban-giggle/api-client';
import { TrendingUp, MapPin, Users, Package } from 'lucide-react';

export default function DemandInsightHub() {
  const [demandData, setDemandData] = useState<DemandSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemand() {
      try {
        const demandApi = new DemandAPI();
        const data = await demandApi.getDemandSummary();
        setDemandData(data);
      } catch (err) {
        console.error('Failed to load demand insights:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDemand();
  }, []);

  if (loading) return <div className="p-4 text-center text-zinc-500">Loading market insights...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-red-600" />
            Market Demand Heatmap
          </h2>
          <p className="text-zinc-500 text-sm">Unmet user requests to help you plan your next group</p>
        </div>
      </div>

      {demandData.length === 0 ? (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-12 text-center">
          <Package className="mx-auto text-zinc-400 mb-4" size={48} />
          <p className="text-zinc-600 dark:text-zinc-400">No unmet demand signals yet. Keep an eye on this space!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {demandData.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-red-400 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{item.requested_product_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.product_category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} /> 
                      <span>{item.total_requests} users interested</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package size={14} /> 
                      <span>{item.total_requested_quantity}kg total demand</span>
                    </div>
                    {item.region && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> 
                        <span>{item.region}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                  Start Group
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
