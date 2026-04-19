'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  PlusCircle, 
  ArrowUpRight,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mock data for initial load to prevent layout shift
const MOCK_REVENUE_DATA = [
  { day: 'Apr 01', revenue: 400 },
  { day: 'Apr 05', revenue: 300 },
  { day: 'Apr 10', revenue: 600 },
  { day: 'Apr 15', revenue: 800 },
  { day: 'Apr 20', revenue: 500 },
  { day: 'Apr 25', revenue: 900 },
];

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    lowStockCount: 0,
  });
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE_DATA);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // In a real app, these would be calls to our new secure API routes
        // For this revamp, we are simulating the fetch of the new RPCs
        const revResponse = await fetch('/api/seller/analytics/timeseries');
        if (revResponse.ok) {
          const data = await revResponse.json();
          setRevenueData(data);
        }

        const stockResponse = await fetch('/api/seller/analytics/low-stock');
        if (stockResponse.ok) {
          const data = await stockResponse.json();
          setLowStockProducts(data);
          setAnalytics(prev => ({ ...prev, lowStockCount: data.length }));
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p l-8 lg:p-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-primary" />
            Seller Command Center
          </h1>
          <p className="text-slate-500 mt-1">Welcome back! Here is your business overview.</p>
        </div>
        <Link 
          href="/seller/products/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
        >
          <PlusCircle size={20} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Stat Cards Grid - Mobile First (1 col -> 2 col -> 4 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${analytics.totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-500" />} 
          trend="+12.5%" 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Total Orders" 
          value={analytics.totalOrders} 
          icon={<ShoppingCart className="text-blue-500" />} 
          trend="+5.2%" 
          color="bg-blue-50"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${analytics.avgOrderValue}`} 
          icon={<Users className="text-purple-500" />} 
          trend="-2.1%" 
          color="bg-purple-50"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={analytics.lowStockCount} 
          icon={<AlertTriangle className="text-amber-500" />} 
          trend="Urgent" 
          color="bg-amber-50"
          highlight={analytics.lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart - Takes up 2/3 of space on desktop */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Revenue Growth</h3>
            <select className="text-sm border-none bg-slate-100 rounded-md p-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Low Stock Alerts - Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="text-lg font-semibold text-slate-800">Low Stock Alerts</h3>
          </div>
          
          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 italic">
                All stock levels are healthy
              </div>
            ) : (
              lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.title}</p>
                    <p className="text-xs text-slate-500">Remaining: {product.inventory} units</p>
                  </div>
                  <Link 
                    href={`/dashboard/seller/products/edit/${product.id}`}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowUpRight size={16} className="text-slate-600" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      </div>
    </div>
  );
}
