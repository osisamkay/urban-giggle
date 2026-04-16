import { supabase } from '../supabase/client';
import type { Database } from '../supabase/database.types';

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

export const reviewsApi = {
    getReviewsByProduct: async (productId: string) => {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        user:users(
          first_name,
          last_name,
          avatar_url
        )
      `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any;
    },

    createReview: async (review: ReviewInsert) => {
        const { data, error } = await supabase
            .from('reviews')
            // @ts-ignore
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data as any;
    },

    getReviewStats: async (productId: string) => {
        // Calculate average? Supabase doesn't do aggregation nicely in client easily without RPC.
        // But we have average_rating on products table (updated via trigger presumably).
        // We'll rely on product data for stats.
        return null;
    },

    // ===== ADMIN FUNCTIONS =====

    // Get all reviews for admin
    getAllReviews: async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:users(
                    id,
                    first_name,
                    last_name,
                    email,
                    avatar_url
                ),
                product:products(
                    id,
                    title,
                    images,
                    seller:seller_profiles(
                        business_name
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any;
    },

    // Get review stats for admin dashboard
    getReviewsStats: async () => {
        const { data, error } = await supabase
            .from('reviews')
            .select('id, rating, verified, created_at');

        if (error) throw error;

        const reviews = data || [];
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalReviews = reviews.length;
        const verifiedReviews = reviews.filter((r: any) => r.verified).length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
            : 0;
        const newThisWeek = reviews.filter((r: any) => new Date(r.created_at) > weekAgo).length;

        // Rating distribution
        const ratingDistribution = {
            1: reviews.filter((r: any) => r.rating === 1).length,
            2: reviews.filter((r: any) => r.rating === 2).length,
            3: reviews.filter((r: any) => r.rating === 3).length,
            4: reviews.filter((r: any) => r.rating === 4).length,
            5: reviews.filter((r: any) => r.rating === 5).length,
        };

        return {
            totalReviews,
            verifiedReviews,
            averageRating,
            newThisWeek,
            ratingDistribution,
        };
    },

    // Delete a review (admin moderation)
    deleteReview: async (reviewId: string) => {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;
    },

    // Toggle review verified status
    toggleVerified: async (reviewId: string, verified: boolean) => {
        const { data, error } = await supabase
            .from('reviews')
            // @ts-ignore
            .update({ verified })
            .eq('id', reviewId)
            .select()
            .single();

        if (error) throw error;
        return data as any;
    },

    // Update review (admin can edit if needed)
    updateReview: async (reviewId: string, updates: { title?: string; comment?: string }) => {
        const { data, error } = await supabase
            .from('reviews')
            // @ts-ignore
            .update(updates)
            .eq('id', reviewId)
            .select()
            .single();

        if (error) throw error;
        return data as any;
    },
};
