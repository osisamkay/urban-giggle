import type { SupabaseClient } from '@supabase/supabase-js';
import type { Review, ApiResponse } from '@sharesteak/types';

export class ReviewsAPI {
  constructor(private supabase: SupabaseClient) {}

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('*, user:users(id, first_name, last_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as Review[],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch reviews',
        },
      };
    }
  }

  async createReview(review: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<ApiResponse<Review>> {
    try {
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review via API');
      }

      const data = await response.json();

      return {
        success: true,
        data: data as Review,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create review',
        },
      };
    }
  }

  async updateReview(reviewId: string, updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }): Promise<ApiResponse<Review>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      // Update product rating
      await this.updateProductRating(data.product_id);

      return {
        success: true,
        data: data as Review,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update review',
        },
      };
    }
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/reviews/delete?id=${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review via API');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete review',
        },
      };
    }
  }

  private async updateProductRating(productId: string): Promise<void> {
    const { data } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (data && data.length > 0) {
      const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;

      await this.supabase
        .from('products')
        .update({
          average_rating: avgRating,
          review_count: data.length,
        })
        .eq('id', productId);
    }
  }
}
