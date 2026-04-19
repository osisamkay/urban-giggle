import React, { useState } from 'react';
import { TrustAndGrowthAPI } from '@urban-giggle/api-client';
import { AlertCircle, Gift, Share2, CheckCircle } from 'lucide-react';

export default function GrowthAndTrustHub() {
  const [referralData, setReferralData] = useState<{ total: number; claimed: number; code: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const api = new TrustAndGrowthAPI();
        const stats = await api.getReferralStats();
        setReferralData({
          total: stats.total_referrals,
          claimed: stats.rewards_claimed,
          code: stats.referral_code,
        });
      } catch (err) {
        console.error('Referral load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  if (loading) return <div className="p-6 text-center text-zinc-500">Loading your perks...</div>;

  return (
    <div className="space-y-6">
      {/* Referral Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2 justify-center md:justify-start">
              <Gift size={24} /> Invite Friends, Get Steak
            </h3>
            <p className="text-indigo-100 opacity-80">Share the power of collective buying. Get a $10 credit for every friend who joins their first group.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 text-center min-w-[200px]">
            <span className="text-xs uppercase font-bold tracking-widest opacity-70 block mb-1">Your Referral Code</span>
            <span className="text-2xl font-mono font-black">{referralData?.code}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(referralData?.code || '')}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Stats */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={18} /> Referral Progress
          </h4>
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-3xl font-black">{referralData?.total}</div>
              <div className="text-xs text-zinc-500 uppercase">Friends Invited</div>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="text-center flex-1">
              <div className="text-3xl font-black text-green-600">{referralData?.claimed}</div>
              <div className="text-xs text-zinc-500 uppercase">Rewards Earned</div>
            </div>
          </div>
        </div>

        {/* Dispute Quick-Link */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-600" size={18} /> Quality Assurance
          </h4>
          <p className="text-sm text-zinc-500 mb-4">
            Not satisfied with your order? Open a dispute for a rapid review by our admin team.
          </p>
          <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-colors">
            Open a Dispute
          </button>
        </div>
      </div>
    </div>
  );
}
