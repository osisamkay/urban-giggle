import React, { useState } from 'react';
import { DemandAPI, DemandSignal } from '@urban-giggle/api-client';
import { PackagePlus, Send } from 'lucide-react';

export default function RequestProductModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    requested_product_name: '',
    product_category: 'Beef',
    estimated_quantity: 1,
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const demandApi = new DemandAPI();
      // In a real app, user_id would come from the auth context
      await demandApi.submitDemand({
        ...formData,
        user_id: 'current-user-id', // Placeholder: handled by server-side RLS/Auth in production
        estimated_quantity: Number(formData.estimated_quantity),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <PackagePlus className="text-red-600" />
          <h2 className="text-xl font-bold">Request a Premium Cut</h2>
        </div>
        
        {submitted ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-zinc-600 dark:text-zinc-400">Request sent! We'll notify you if a seller opens a group.</p>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input 
                required
                className="w-full rounded-lg border p-2 dark:bg-zinc-800 dark:border-zinc-700" 
                placeholder="e.g. A5 Wagyu Ribeye"
                value={formData.requested_product_name}
                onChange={e => setFormData({...formData, requested_product_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  className="w-full rounded-lg border p-2 dark:bg-zinc-800 dark:border-zinc-700"
                  value={formData.product_category}
                  onChange={e => setFormData({...formData, product_category: e.target.value})}
                >
                  <option value="Beef">Beef</option>
                  <option value="Pork">Pork</option>
                  <option value="Lamb">Lamb</option>
                  <option value="Poultry">Poultry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
                <input 
                  type="number" 
                  required
                  className="w-full rounded-lg border p-2 dark:bg-zinc-800 dark:border-zinc-700" 
                  value={formData.estimated_quantity}
                  onChange={e => setFormData({...formData, estimated_quantity: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Region</label>
              <input 
                className="w-full rounded-lg border p-2 dark:bg-zinc-800 dark:border-zinc-700" 
                placeholder="City or Region"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : <><Send size={16} /> Request</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
