import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWishlistStore } from '@/store/wishlistStore';

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

beforeEach(() => {
  useWishlistStore.setState({ items: [], isLoading: false });
});

describe('wishlistStore', () => {
  it('should start with empty wishlist', () => {
    const { items } = useWishlistStore.getState();
    expect(items).toHaveLength(0);
  });

  it('should check if item is in wishlist', () => {
    useWishlistStore.setState({ items: ['prod-1', 'prod-2'] });
    expect(useWishlistStore.getState().isInWishlist('prod-1')).toBe(true);
    expect(useWishlistStore.getState().isInWishlist('prod-3')).toBe(false);
  });

  it('should track loading state', () => {
    useWishlistStore.setState({ isLoading: true });
    expect(useWishlistStore.getState().isLoading).toBe(true);
  });
});
