'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          My Profile
        </h1>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            <Link
              href="/settings"
              className="text-meat-600 hover:text-meat-700 text-sm font-medium"
            >
              Edit Profile
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-meat-100 rounded-full flex items-center justify-center text-3xl font-bold text-meat-600">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="ml-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-2 px-3 py-1 bg-meat-100 text-meat-700 rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/orders"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-meat-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-meat-600"
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
              <div>
                <h3 className="font-semibold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600">View order history</p>
              </div>
            </div>
          </Link>

          <Link
            href="/addresses"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-meat-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-meat-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Addresses</h3>
                <p className="text-sm text-gray-600">Manage shipping addresses</p>
              </div>
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-meat-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-meat-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Wishlist</h3>
                <p className="text-sm text-gray-600">Saved products</p>
              </div>
            </div>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-meat-100 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-meat-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Account preferences</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
