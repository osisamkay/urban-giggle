'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { groupsApi } from '@/lib/api';

export default function GroupPurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [hasJoined, setHasJoined] = useState(false);

  const groupId = params.id as string;

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      return await groupsApi.getGroup(groupId);
    },
  });

  // Check if user has joined
  useEffect(() => {
    const checkMembership = async () => {
      if (user && groupId) {
        const isMember = await groupsApi.isUserInGroup(groupId, user.id);
        setHasJoined(isMember);
      }
    };
    checkMembership();
  }, [user, groupId]);

  const handleJoinGroup = async () => {
    if (!user) {
      router.push('/login?redirect=/groups/' + groupId);
      return;
    }
    try {
      await groupsApi.joinGroup(groupId, user.id, 1); // Default quantity of 1
      setHasJoined(true);
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Failed to join group. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-gray-500">Group not found</div>
        </div>
      </div>
    );
  }

  // Mock data for compatibility with existing UI
  const mockGroup = {
    ...(group as any),
    currentPrice: 89.99,
    targetPrice: 69.99,
    savings: 20.00,
    timeLeft: '2 days',
    items: [
      { name: 'Ribeye Steaks', quantity: '2 lbs', price: 25.99 },
      { name: 'Sirloin Steaks', quantity: '2 lbs', price: 18.99 },
      { name: 'Ground Beef', quantity: '5 lbs', price: 30.00 },
      { name: 'Beef Roast', quantity: '3 lbs', price: 15.01 },
    ],
    features: [
      'USDA Prime Grade',
      'Grass-Fed & Grass-Finished',
      'No Hormones or Antibiotics',
      'Vacuum Sealed',
      'Flash Frozen',
    ],
  };

  const displayGroup = mockGroup;
  const progress = (displayGroup.participant_count / displayGroup.target_quantity) * 100;
  const spotsLeft = displayGroup.target_quantity - displayGroup.participant_count;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-meat-600">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/groups" className="hover:text-meat-600">
                Group Purchases
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium line-clamp-1">{displayGroup.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-3">
                    Active
                  </span>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {displayGroup.title}
                  </h1>
                  <p className="text-lg text-gray-600">by {displayGroup.producer}</p>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {displayGroup.participants} of {displayGroup.targetParticipants} participants
                  </span>
                  <span className="font-semibold text-meat-600">
                    {spotsLeft} spots left
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-meat-500 to-meat-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-meat-50 border border-meat-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Price</p>
                    <p className="text-3xl font-bold text-gray-900">${displayGroup.currentPrice}</p>
                  </div>
                  <svg
                    className="w-8 h-8 text-meat-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target Price</p>
                    <p className="text-3xl font-bold text-meat-600">${displayGroup.targetPrice}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-meat-200">
                  <p className="text-center font-semibold text-meat-700">
                    Save ${displayGroup.savings.toFixed(2)} when target is reached!
                  </p>
                </div>
              </div>

              {/* Time Left */}
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  {displayGroup.timeLeft} left to join
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{displayGroup.description}</p>

              <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
              <div className="space-y-2 mb-6">
                {displayGroup.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-600 text-sm ml-2">({item.quantity})</span>
                      </div>
                    </div>
                    <span className="text-gray-700">${item.price}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Features:</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {displayGroup.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-meat-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Participants ({displayGroup.participants})
              </h2>
              <div className="flex items-center -space-x-2">
                {Array.from({ length: Math.min(10, displayGroup.participants || 0) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-br from-meat-400 to-meat-600 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {displayGroup.participants > 10 && (
                  <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-700 font-semibold text-xs">
                    +{displayGroup.participants - 10}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Join This Group</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Price</span>
                  <span className="font-semibold text-gray-900">${displayGroup.currentPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target Price</span>
                  <span className="font-semibold text-meat-600">${displayGroup.targetPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Potential Savings</span>
                  <span className="font-semibold text-green-600">-${displayGroup.savings.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">You Pay</span>
                  <span className="text-2xl font-bold text-meat-600">${displayGroup.currentPrice}</span>
                </div>
              </div>

              {hasJoined ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <svg
                      className="w-8 h-8 text-green-600 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="font-semibold text-green-900">You've Joined!</p>
                    <p className="text-sm text-green-700 mt-1">
                      We'll notify you when the target is reached
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-center"
                  >
                    View Dashboard
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoinGroup}
                  className="w-full bg-meat-600 text-white py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors mb-3"
                >
                  Join Group Purchase
                </button>
              )}

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">How it works</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-meat-600 text-xs font-bold">1</span>
                    </div>
                    <p className="text-gray-600">Join the group purchase</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-meat-600 text-xs font-bold">2</span>
                    </div>
                    <p className="text-gray-600">Wait for target to be reached</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-meat-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-meat-600 text-xs font-bold">3</span>
                    </div>
                    <p className="text-gray-600">Get wholesale pricing & delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
