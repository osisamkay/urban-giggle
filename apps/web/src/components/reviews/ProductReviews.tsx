'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import WriteReviewModal from './WriteReviewModal';
import Image from 'next/image';

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = useAuthStore(s => s.user);

    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: () => reviewsApi.getReviewsByProduct(productId)
    });

    if (isLoading) return <div className="py-8 text-center text-gray-400">Loading reviews...</div>;

    return (
        <div className="py-12 border-t border-gray-200 scroll-mt-20" id="reviews">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Customer Reviews <span className="text-gray-400 text-lg font-normal">({reviews?.length || 0})</span></h2>
                {user ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Write a Review
                    </button>
                ) : (
                    <div className="text-sm text-gray-500">Log in to write a review</div>
                )}
            </div>

            <div className="space-y-6">
                {!reviews || reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 mb-4 font-medium">No reviews yet.</p>
                        <p className="text-sm text-gray-400">Be the first to share your experience!</p>
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative border border-gray-100">
                                        {review.user?.avatar_url ? (
                                            <Image src={review.user.avatar_url} alt="User" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                                                {review.user?.first_name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {review.user?.first_name} {review.user?.last_name}
                                            {review.verified && <span className="ml-2 text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified Buyer</span>}
                                        </p>
                                        <div className="text-yellow-400 text-sm tracking-tight">
                                            {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            <WriteReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} productId={productId} />
        </div>
    )
}
