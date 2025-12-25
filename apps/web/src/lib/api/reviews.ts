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
    }
};
