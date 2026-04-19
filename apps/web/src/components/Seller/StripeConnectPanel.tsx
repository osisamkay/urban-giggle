import React, { useState, useEffect } from 'react';
import { StripeConnectAPI } from '@urban-giggle/api-client';
import { CreditCard, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StripeConnectPanel() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const api = new StripeConnectAPI();
        const { connected } = await api.checkConnectionStatus();
        setStatus(connected ? 'connected' : 'disconnected');
      } catch (err) {
        console.error('Status check failed:', err);
        setStatus('disconnected');
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const api = new StripeConnectAPI();
      const { url } = await api.createOnboardingLink();
      // Redirect user to Stripe's hosted onboarding flow
      window.location.href = url;
    } catch (err) {
      alert('Failed to generate Stripe link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <CreditCard className="text-indigo-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Payout Settings</h3>
            <p className="text-zinc-500 text-sm">Connect your bank account to receive funds</p>
          </div>
        </div>
        {status === 'connected' && (
          <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <CheckCircle2 size={14} /> Connected
          </span>
        )}
      </div>

      {status === 'connected' ? (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Your payouts are active. Funds from filled groups will be sent directly to your connected bank account.
          </div>
          <button 
            className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1"
            onClick={() => window.open('https://dashboard.stripe.com/express', '_blank')}
          >
            Manage Payouts <ExternalLink size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You haven't connected a payout account. You won't be able to create new groups until this is completed.
            </p>
          </div>
          <button 
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Generating Link...' : 'Connect with Stripe'}
          </button>
        </div>
      )}
    </div>
  );
}
