'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

interface WriteReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

export default function WriteReviewModal({ isOpen, onClose, productId }: WriteReviewModalProps) {
    const user = useAuthStore(s => s.user);
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('Must be logged in');
            await reviewsApi.createReview({
                product_id: productId,
                user_id: user.id,
                rating,
                title,
                comment,
                verified: false,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            toast.success('Review submitted!');
            setTitle('');
            setComment('');
            setRating(5);
            onClose();
        },
        onError: () => toast.error('Failed to submit review')
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                type="button"
                                className={`text-2xl transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-meat-500 focus:border-transparent outline-none transition-all"
                        placeholder="Summarize your experience"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Review</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 min-h-[100px] focus:ring-2 focus:ring-meat-500 focus:border-transparent outline-none transition-all"
                        placeholder="Share your thoughts..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !title || !comment}
                        className="px-4 py-2 bg-meat-600 text-white rounded-lg hover:bg-meat-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
                    >
                        {mutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    )
}
