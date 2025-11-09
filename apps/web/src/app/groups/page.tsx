'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { GroupsAPI } from '@sharesteak/api-client';
import { Navbar } from '@/components/Navbar';

export default function GroupPurchasesPage() {
  const groupsAPI = new GroupsAPI(supabase);

  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const result = await groupsAPI.getActiveGroups();
      return result.data;
    },
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Group Purchases
          </h1>
          <p className="text-gray-600">
            Join group purchases to unlock better prices through collective buying
            power
          </p>
        </div>

        {/* Active Groups */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((group) => {
              const progress = calculateProgress(
                group.currentQuantity,
                group.targetQuantity
              );
              const daysRemaining = Math.ceil(
                (new Date(group.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="aspect-video bg-gray-200 relative">
                    {group.product?.images && group.product.images.length > 0 ? (
                      <img
                        src={group.product.images[0]}
                        alt={group.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {daysRemaining}d left
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {group.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {group.description || group.product?.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{group.participantCount} participants</span>
                        <span>
                          {group.currentQuantity}/{group.targetQuantity} units
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="space-y-2 mb-4">
                      {group.priceTiers.slice(0, 2).map((tier, idx) => (
                        <div
                          key={idx}
                          className={`text-sm px-3 py-2 rounded ${
                            group.currentQuantity >= tier.minQuantity
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{tier.minQuantity}+ units</span>
                            <span className="font-semibold">
                              ${tier.pricePerUnit.toFixed(2)}
                              {tier.discountPercentage > 0 && (
                                <span className="ml-1 text-xs">
                                  (-{tier.discountPercentage}%)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Organized by {group.organizer?.firstName || 'Anonymous'}
                      </div>
                      <div className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-semibold">
                        Join Group
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">No active group purchases</p>
            <Link
              href="/groups/create"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Create Group Purchase
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
