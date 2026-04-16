'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isSeller, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (isAdmin()) {
      router.push('/dashboard/admin');
    } else if (isSeller()) {
      router.push('/dashboard/seller');
    }
  }, [user, isAdmin, isSeller, router]);

  if (!user || isAdmin() || isSeller()) {
    return <div className="p-12 text-center text-gray-400">Loading Dashboard...</div>;
  }

  // Regular User Dashboard View (Overview)
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back, {user.firstName}!</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-lg mb-4">My Activity</h2>
          <div className="space-y-4">
            <Link href="/dashboard/orders" className="block p-4 border border-gray-100 rounded-lg hover:border-meat-200 hover:bg-meat-50 transition">
              <span className="font-medium text-gray-900">Recent Orders</span>
              <p className="text-sm text-gray-500 mt-1">Track your meat deliveries</p>
            </Link>
            <Link href="/groups" className="block p-4 border border-gray-100 rounded-lg hover:border-meat-200 hover:bg-meat-50 transition">
              <span className="font-medium text-gray-900">Active Group Buys</span>
              <p className="text-sm text-gray-500 mt-1">Check progress on your shares</p>
            </Link>
          </div>
        </div>
        <div className="bg-meat-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="font-semibold text-lg mb-2">Want to Sell?</h2>
          <p className="mb-6 opacity-90">Join our network of local producers.</p>
          <button className="bg-white text-meat-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition">
            Apply to be a Seller
          </button>
        </div>
      </div>
    </div>
  );
}
