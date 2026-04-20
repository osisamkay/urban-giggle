'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const MOCK_PLATFORM_STATS = {
  totalGMV: 124500,
  activeSellers: 42,
  totalUsers: 1250,
  pendingVerifications: 8,
};

const MOCK_MERCHANT_QUEUE = [
  { id: 'merch-1', name: 'Premium Cuts Co.', location: 'Texas', documents: 'Verified', status: 'PENDING' },
  { id: 'merch-2', name: 'Organic Beef Farm', location: 'Iowa', documents: 'Missing', status: 'PENDING' },
  { id: 'merch-3', name: 'Steakhouse Direct', location: 'Florida', documents: 'Verified', status: 'PENDING' },
];

export default function AdminDashboard() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  const handleVerify = async (sellerId: string, status: 'APPROVED' | 'REJECTED', level?: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/verify-seller', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sellerId, 
          newStatus: status, 
          newLevel: level || 'VERIFIED' 
        }),
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Verification failed", e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">
            <ShieldCheck size={14} />
            System Administrator
          </div>
          <h1 className="text-3xl font-black text-slate-900">Platform Overwatch</h1>
          <p className="text-slate-500 mt-1">Global system health and merchant governance.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <div className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* TOP ROW: Global Metrics (4 cols) */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard title="Total GMV" value={`$${MOCK_PLATFORM_STATS.totalGMV.toLocaleString()}`} icon={<TrendingUp className="text-indigo-600" />} trend="+12.5%" color="bg-indigo-50" />
          <MetricCard title="Active Sellers" value={MOCK_PLATFORM_STATS.activeSellers} icon={<Users className="text-blue-600" />} trend="+5.2%" color="bg-blue-50" />
          <MetricCard title="Total Users" value={MOCK_PLATFORM_STATS.totalUsers} icon={<Activity className="text-emerald-600" />} trend="+1.1%" color="bg-emerald-50" />
          <MetricCard title="Pending Verifications" value={MOCK_PLATFORM_STATS.pendingVerifications} icon={<Clock size={20} className="text-amber-600" />} trend="Urgent" color="bg-amber-50" highlight={true} />
        </div>

        {/* MIDDLE ROW: Verification Queue (8 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" />
              Merchant Verification Queue
            </h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search merchants..." 
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
                <Filter size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Compliance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_MERCHANT_QUEUE.map((merchant, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{merchant.name}</p>
                      <p className="text-xs text-slate-500">ID: {merchant.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{merchant.location}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${merchant.documents === 'Verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {merchant.documents}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedMerchant(merchant)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                          title="Review Documents"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleVerify(merchant.id, 'APPROVED', 'VERIFIED')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleVerify(merchant.id, 'REJECTED')}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: System Health & Monitoring (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-indigo-600" />
              System Health
            </h3>
            <div className="space-y-4">
              <HealthItem label="API Latency" status="Optimal" value="42ms" color="text-emerald-500" />
              <HealthItem label="Database Load" status="Stable" value="12%" color="text-emerald-500" />
              <HealthItem label="Stripe Webhooks" status="Active" value="Synced" color="text-emerald-500" />
              <HealthItem label="Reaper Cron" status="Healthy" value="Last run: 5m ago" color="text-emerald-500" />
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Admin Tip</h3>
              <p className="text-indigo-200 text-sm mb-4">
                The "Wagyu" category is seeing a 20% surge in demand. Consider inviting more specialty vendors from Japan.
              </p>
              <button className="flex items-center gap-2 text-xs font-bold bg-white text-indigo-900 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all">
                Send Invite <ArrowRight size={14} />
              </button>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Review Merchant: {selectedMerchant.name}</h3>
                <button onClick={() => setSelectedMerchant(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle size={24} className="text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    <p className="font-semibold text-slate-900">{selectedMerchant.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Compliance Status</p>
                    <p className={`text-sm font-bold ${selectedMerchant.documents === 'Verified' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedMerchant.documents}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Submitted Documents</p>
                  <div className="grid grid-cols-1 gap-3">
                    {['Gov_ID.pdf', 'Business_License.jpg', 'Health_Permit.pdf'].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-slate-400 group-hover:text-indigo-600" />
                          <span className="text-sm text-slate-600">{doc}</span>
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedMerchant(null)}
                  className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => { handleVerify(selectedMerchant.id, 'REJECTED'); setSelectedMerchant(null); }}
                  className="px-6 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => { handleVerify(selectedMerchant.id, 'APPROVED', 'VERIFIED'); setSelectedMerchant(null); }}
                  className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200"
                >
                  Approve & Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, color, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-2 ring-amber-400' : ''}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      </div>
    </div>
  );
}

function HealthItem({ label, status, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="text-right">
        <p className={`text-xs font-bold ${color}`}>{status}</p>
        <p className="text-[10px] text-slate-400">{value}</p>
      </div>
    </div>
  );
}

function ShieldCheckIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
