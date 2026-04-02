'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Stagger animations
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowSteps(true), 800);
  }, [user, router]);

  if (!user) return null;

  const orderNumber = 'SS-' + Date.now().toString(36).toUpperCase();
  const orderDate = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Success Animation */}
        <div className="text-center mb-10">
          <div className={`transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            {/* Animated checkmark */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
              <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Order Placed! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Fresh meat is on its way to you
            </p>
          </div>
        </div>

        {/* Order Card */}
        <div className={`transition-all duration-500 delay-200 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex justify-between items-center text-white">
                <div>
                  <p className="text-sm opacity-80">Order Number</p>
                  <p className="text-xl font-bold tracking-wide">{orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <p className="font-semibold">Confirmed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Date</p>
                  <p className="font-medium text-gray-900">{orderDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Delivery</p>
                  <p className="font-medium text-green-700">{estimatedDelivery}</p>
                </div>
              </div>

              {/* Email notice */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Confirmation sent to</p>
                  <p className="text-sm text-blue-700">{user.email || 'your email'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next - Timeline */}
        <div className={`transition-all duration-500 ${showSteps ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">What happens next?</h3>

            <div className="space-y-0">
              {[
                { step: 1, title: 'Order Processing', desc: 'The seller is preparing your fresh meat order', icon: '📦', active: true },
                { step: 2, title: 'Quality Check', desc: 'Your order passes our quality inspection', icon: '✅', active: false },
                { step: 3, title: 'Shipped', desc: "You'll get a tracking number via email", icon: '🚚', active: false },
                { step: 4, title: 'Delivered', desc: 'Fresh to your door — enjoy!', icon: '🏠', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.active ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100'}`}>
                      {item.icon}
                    </div>
                    {i < 3 && <div className={`w-0.5 h-8 ${item.active ? 'bg-green-300' : 'bg-gray-200'}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`font-semibold ${item.active ? 'text-green-700' : 'text-gray-700'}`}>
                      {item.title}
                      {item.active && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>}
                    </p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`transition-all duration-500 delay-500 ${showSteps ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-center shadow-lg"
            >
              📋 View My Orders
            </Link>
            <Link
              href="/products"
              className="flex-1 px-6 py-3.5 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
            >
              🥩 Continue Shopping
            </Link>
          </div>

          {/* Fun message */}
          <p className="text-center text-sm text-gray-400 mt-8">
            🔥 Pro tip: Join a group purchase next time to save even more!
          </p>
        </div>
      </div>
    </div>
  );
}
