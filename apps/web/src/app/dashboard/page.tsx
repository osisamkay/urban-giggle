'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingBag,
  Trophy,
  Package,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Mock data for the "Savings" and "Journey" experience
const MOCK_SAVINGS = {
  totalSaved: 142.50,
  activeSavings: 28.00,
  recentWins: [
    { product: 'Prime Ribeye', saved: 12.50, group: 'Group #42', status: 'Confirmed' },
    { product: 'Wagyu Brisket', saved: 15.50, group: 'Group #18', status: 'Pending' },
  ]
};

const MOCK_ACTIVE_ORDERS = [
  { id: 'ORD-9921', product: 'Prime Ribeye', status: 'Processing', step: 2, date: '2 hours ago' },
  { id: 'ORD-8812', product: 'Wagyu T-Bone', status: 'Shipped', step: 3, date: 'Yesterday' },
];

export default function BuyerDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [isLoading, setIsLoading] = useState(true);

  // Send admins and sellers to their own dashboards. Wait for the auth store to
  // finish hydrating so we don't redirect off the page during the brief window
  // when persisted state hasn't loaded yet.
  useEffect(() => {
    if (!hasHydrated) return;
    if (user?.role === 'ADMIN') {
      router.replace('/admin');
    } else if (user?.role === 'SELLER') {
      router.replace('/dashboard/seller');
    }
  }, [hasHydrated, user, router]);

  useEffect(() => {
    // Simulate loading state for a smooth transition
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12">
      {/* Header: Personalized Greeting */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hello, Steak Lover! 👋</h1>
          <p className="text-slate-500 mt-1">Your laird-grade meats are on the way.</p>
        </div>
        <div className="relative p-2 bg-white rounded-full shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
          <Bell size={24} className="text-slate-600" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-rose-500 border-2 border-white rounded-full"></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Savings & Highlights (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* THE SAVINGS VAULT */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Trophy size={20} />
                <span className="text-sm font-medium uppercase tracking-wider">Lifetime Savings</span>
              </div>
              <h2 className="text-5xl font-black mb-2">${MOCK_SAVINGS.totalSaved}</h2>
              <p className="text-indigo-100 text-sm">You've saved this much by buying in groups!</p>
              
              <div className="mt-6 pt-6 border-t border-indigo-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100 text-xs">Active Group Savings</span>
                  <span className="font-bold text-lg">${MOCK_SAVINGS.activeSavings}</span>
                </div>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Recent Wins List */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" />
              Recent Wins
            </h3>
            <div className="space-y-3">
              {MOCK_SAVINGS.recentWins.map((win, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{win.product}</p>
                    <p className="text-xs text-slate-500">{win.group}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">-${win.saved}</p>
                    <p className={`text-[10px] uppercase font-bold ${win.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {win.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Orders & Discovery (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ACTIVE JOURNEY: Order Timeline */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              Active Journeys
            </h3>
            
            <div className="space-y-6">
              {MOCK_ACTIVE_ORDERS.map((order, i) => (
                <div key={i} className="relative pl-8 border-l-2 border-slate-100 pb-6 last:pb-0">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-2 top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm ${order.step >= 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase">{order.id}</span>
                        <span className="text-xs text-slate-400">• {order.date}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">{order.product}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <Link 
                      href={`/orders/${order.id}`} 
                      className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Track Order <ArrowUpRight size={16} />
                    </Link>
                  </div>
                  
                  {/* Progress Stepper (Visual only for this demo) */}
                  <div className="flex gap-2 mt-4">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 flex-1 rounded-full transition-all ${step <= order.step ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMART SUGGESTIONS: Group Discovery */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Join a Group & Save</h3>
              <Link href="/groups" className="text-sm text-indigo-600 font-medium hover:underline">View all groups</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Wagyu A5 Special', progress: 85, target: 20, current: 17, saving: '$15 off' },
                { name: 'Prime Ribeye Bulk', progress: 40, target: 50, current: 20, saving: '$10 off' },
              ].map((group, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900">{group.name}</h4>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{group.saving}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${group.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500">{group.current}/{group.target}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/groups/${i}`} 
                    className="w-full text-center py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Join Group
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
