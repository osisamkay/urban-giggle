import React, { useState, useEffect } from 'react';
import { SubscriptionAPI, SubscriptionPlan } from '@urban-giggle/api-client';
import { ShieldCheck, Zap, Crown, Check } from 'lucide-react';

export default function TierUpgradePanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const api = new SubscriptionAPI();
        const data = await api.getPlans();
        setPlans(data);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const api = new SubscriptionAPI();
      const { url } = await api.createUpgradeSession(planId);
      window.location.href = url;
    } catch (err) {
      alert('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-zinc-500">Loading plans...</div>;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-black mb-2">Level Up Your Business</h2>
        <p className="text-zinc-500">Upgrade your seller tier to unlock higher limits, priority visibility, and advanced analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative p-6 rounded-3xl border transition-all duration-300 ${
              plan.id === 'PLATINUM' 
                ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 ring-2 ring-yellow-500/20' 
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
            }`}
          >
            {plan.id === 'PLATINUM' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                plan.id === 'BASIC' ? 'bg-zinc-100 dark:bg-zinc-800' : 
                plan.id === 'VERIFIED' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {plan.id === 'BASIC' ? <ShieldCheck className="text-zinc-600" size={24} /> : 
                 plan.id === 'VERIFIED' ? <Zap className="text-blue-600" size={24} /> : 
                 <Crown className="text-yellow-600" size={24} />}
              </div>
              <h3 className="font-bold text-xl">{plan.name}</h3>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-black">${plan.monthly_price}</span>
              <span className="text-zinc-500 text-sm ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                <span>Value Limit: ${plan.value_limit.toLocaleString()}</span>
              </li>
              {plan.features.can_boost && (
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Promoted Groups (Boost)</span>
                </li>
              )}
              {plan.features.analytics_access && (
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Advanced Demand Analytics</span>
                </li>
              )}
              {plan.features.priority_support && (
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Priority Support Line</span>
                </li>
              )}
            </ul>

            <button 
              onClick={() => handleUpgrade(plan.id)}
              disabled={upgrading === plan.id}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                plan.id === 'PLATINUM' 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
              }`}
            >
              {upgrading === plan.id ? 'Redirecting...' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
