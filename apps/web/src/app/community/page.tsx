'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ForumsAPI } from '@sharesteak/api-client';

export default function CommunityPage() {
  const forumsAPI = new ForumsAPI(supabase);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const result = await forumsAPI.getCategories();
      return result.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">
            Connect with other meat enthusiasts, share recipes, and get
            recommendations
          </p>
        </div>

        {/* Forum Categories */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/community/${category.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{category.icon || '📋'}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {category.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      {category.threadCount} discussions
                    </div>
                  </div>
                  <div>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No forum categories available</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Link
            href="/community/new-thread"
            className="bg-primary-600 text-white p-6 rounded-lg hover:bg-primary-700 transition text-center"
          >
            <svg
              className="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <h3 className="font-bold mb-1">Start Discussion</h3>
            <p className="text-sm opacity-90">Share your thoughts</p>
          </Link>

          <Link
            href="/messages"
            className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-primary-600 transition text-center"
          >
            <svg
              className="w-12 h-12 mx-auto mb-3 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="font-bold mb-1 text-gray-900">Messages</h3>
            <p className="text-sm text-gray-600">Direct chat with members</p>
          </Link>

          <Link
            href="/community/popular"
            className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-primary-600 transition text-center"
          >
            <svg
              className="w-12 h-12 mx-auto mb-3 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <h3 className="font-bold mb-1 text-gray-900">Popular Topics</h3>
            <p className="text-sm text-gray-600">Trending discussions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
