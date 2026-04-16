'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await ordersApi.getUserOrders(user.id);
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your order history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-meat-600 text-white rounded-lg font-medium">
              All Orders
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Processing
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Shipped
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Delivered
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Cancelled
            </button>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              href="/products"
              className="inline-block bg-meat-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Card Example */}
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {order.status}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${order.total?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          View Details
                        </Link>
                        {order.status === 'DELIVERED' && (
                          <button className="px-4 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 font-medium">
                            Buy Again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
