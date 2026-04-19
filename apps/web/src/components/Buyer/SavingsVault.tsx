import React, { useEffect, useState } from 'react';
import { SavingsAPI, BuyerSavings } from '@urban-giggle/api-client';
import { Wallet, Leaf, ShoppingBag, TrendingDown } from 'lucide-react';

export default function SavingsVault() {
  const [savings, setSavings] = useState<BuyerSavings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavings() {
      try {
        const api = new SavingsAPI();
        const data = await api.getMySavings();
        setSavings(data);
      } catch (err) {
        console.error('Failed to load savings vault:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSavings();
  }, []);

  if (loading) return <div className="p-6 text-center text-zinc-500">Opening your vault...</div>;

  if (!savings) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-12 text-center">
        <Wallet className="mx-auto text-zinc-400 mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">Your Vault is Empty</h3>
        <p className="text-zinc-600 dark:text-zinc-400">Join your first group purchase to start accumulating savings!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Total Lifetime Savings</span>
          </div>
          <div className="text-6xl font-black mb-6">${savings.total_saved.toLocaleString()}</div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingBag size={20} />
              </div>
              <div>
                <div className="text-xs opacity-70">Groups Joined</div>
                <div className="font-bold">{savings.groups_joined}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Leaf size={20} />
              </div>
              <div>
                <div className="text-xs opacity-70">Carbon Offset</div>
                <div className="font-bold">{savings.carbon_offset_kg.toFixed(1)} kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Wallet className="text-red-600" size={18} />
            Financial Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Investment</span>
              <span className="font-semibold">${savings.total_spent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Collective Benefit</span>
              <span className="font-semibold text-green-600">${savings.total_saved.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between font-bold">
              <span>Net Cost</span>
              <span>${(savings.total_spent - savings.total_saved).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Leaf className="text-green-600" size={18} />
            Eco-Impact
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed">
            By joining collective groups, you've reduced the number of individual shipments. 
            Your total offset of <span className="text-green-600 font-bold">{savings.carbon_offset_kg.toFixed(1)}kg</span> 
            is equivalent to planting approximately {Math.round(savings.carbon_offset_kg / 20)} trees.
          </p>
        </div>
      </div>
    </div>
  );
}
