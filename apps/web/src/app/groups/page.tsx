'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api';
import { calculateSharePercentage, formatShare, SHARE_SIZES } from '@/lib/ShareCalculator';
import type { GroupPurchase } from '@sharesteak/types';

export default function GroupPurchasesPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      return await groupsApi.getActiveGroups();
    },
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50">

      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Group Sharing Opportunities
          </h1>
          <p className="text-gray-600">
            Join neighbors to buy premium meat in bulk. Reserve your share (fractional or bulk) and unlock wholesale pricing.
          </p>
        </div>

        {/* Active Groups */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: GroupPurchase) => {
              const category = group.product?.category || 'BEEF';
              const progress = calculateSharePercentage(group.currentQuantity, group.targetQuantity);
              const daysRemaining = Math.max(0, Math.ceil(
                (new Date(group.deadline).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
              ));

              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {group.product?.images && group.product.images.length > 0 ? (
                      <Image
                        src={group.product.images[0]}
                        alt={group.title}
                        fill
                        className="object-cover transform group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <Image
                        src="/images/hero-1.png"
                        alt={group.title}
                        fill
                        className="object-cover transform group-hover:scale-105 transition duration-500 opacity-90"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
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
                        <span>{group.participantCount} neighbors joined</span>
                        <span className="font-medium text-primary-700">
                          {formatShare(group.currentQuantity, category)} Sold
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available Options</div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Show 1/16 and 1/4 specifically if available, or just first two */}
                        {group.priceTiers.slice(0, 2).map((tier: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                            <div className="text-sm font-bold text-gray-900">{formatShare(tier.minQuantity, category)}</div>
                            <div className="text-green-600 font-medium">${tier.pricePerUnit.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Organized by <span className="font-medium text-gray-900">{group.organizer?.firstName || 'Local Farmer'}</span>
                      </div>
                      <div className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-primary-700 transition">
                        Reserve Share
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
              Start a Group Buy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
