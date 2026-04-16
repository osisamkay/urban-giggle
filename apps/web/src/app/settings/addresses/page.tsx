'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    // TODO: Fetch addresses from API
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    // TODO: API call to set default address
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    // TODO: API call to delete address
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/settings"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Shipping Addresses
            </h1>
          </div>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>

        {/* Add New Address Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 px-6 py-3 bg-meat-600 text-white rounded-lg font-semibold hover:bg-meat-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Address'}
        </button>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              New Address
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                    placeholder="Anytown"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                    placeholder="CA"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="w-4 h-4 text-meat-600 border-gray-300 rounded focus:ring-meat-500"
                />
                <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-meat-600 text-white rounded-lg font-semibold hover:bg-meat-700 transition-colors"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Saved Addresses */}
        {addresses.length === 0 ? (
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved addresses
            </h3>
            <p className="text-gray-600">
              Add your first shipping address to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-xl shadow-md p-6 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-meat-100 text-meat-700 text-xs font-semibold rounded-full">
                    Default
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {address.name}
                  </h3>
                  <div className="text-gray-700">
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="mt-2 text-gray-600">Phone: {address.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                    >
                      Set as Default
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
