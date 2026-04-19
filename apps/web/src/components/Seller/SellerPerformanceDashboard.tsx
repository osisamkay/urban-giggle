import React, { useEffect, useState } from 'react';
import { AnalyticsAPI, GroupAnalytics, RevenueData } from '@urban-giggle/api-client';
import { BarChart3, ArrowUpRight, Zap, DollarSign } from 'lucide-react';

export default function SellerPerformanceDashboard() {
  const [analytics, setAnalytics] = useState<GroupAnalytics[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const api = new AnalyticsAPI();
        const [conv, rev] = await Promise.all([
          api.getGroupConversion(),
          api.getRevenueVelocity()
        ]);
        setAnalytics(conv);
        setRevenue(rev);
      } catch (err) {
        console.error('Analytics load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-6 text-center text-zinc-500">Calculating performance...</div>;

  const totalRevenue = revenue.reduce((acc, curr) => acc + curr.daily_revenue, 0);
  const avgConversion = analytics.length 
    ? (analytics.reduce((acc, curr) => acc + curr.conversion_rate, 0) / analytics.length).toFixed(1) 
    : '0';

  return (
    <div className="space-y-8">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">Total Revenue</span>
            <DollarSign className="text-green-500" size={18} />
          </div>
          <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
          <div className="text-green-500 text-xs mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> +12% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">Avg. Conversion Rate</span>
            <Zap className="text-yellow-500" size={18} />
          </div>
          <div className="text-3xl font-bold">{avgConversion}%</div>
          <div className="text-zinc-400 text-xs mt-1">Based on group views vs joins</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">Groups Filled</span>
            <BarChart3 className="text-blue-500" size={18} />
          </div>
          <div className="text-3xl font-bold">{revenue.reduce((acc, curr) => acc + curr.groups_filled, 0)}</div>
          <div className="text-zinc-400 text-xs mt-1">Successful collective buys</div>
        </div>
      </div>

      {/* Conversion Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold text-lg">Group Conversion Funnels</h3>
          <p className="text-zinc-500 text-sm">Analyze which products attract the most buyers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">Group ID</th>
                <th className="px-6 py-3 text-center">Views</th>
                <th className="px-6 py-3 text-center">Joins</th>
                <th className="px-6 py-3 text-center">Conv. Rate</th>
                <th className="px-6 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {analytics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">No analytics data available yet</td>
                </tr>
              ) : (
                analytics.map((item) => (
                  <tr key={item.group_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.group_id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-center">{item.views}</td>
                    <td className="px-6 py-4 text-center">{item.joins}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.conversion_rate > 20 ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {item.conversion_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">${item.revenue.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
