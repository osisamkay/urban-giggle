import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from '@/lib/api';

interface WishlistState {
  wishlistIds: string[]; // Store product IDs for quick lookup
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const wishlist = await wishlistApi.getUserWishlist();
          const ids = wishlist?.map((item: any) => item.product.id) || [];
          set({ wishlistIds: ids, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
          set({ isLoading: false });
        }
      },

      toggleWishlist: async (productId: string) => {
        try {
          const added = await wishlistApi.toggleWishlist(productId);

          if (added) {
            // Add to wishlist
            set((state) => ({
              wishlistIds: [...state.wishlistIds, productId],
            }));
          } else {
            // Remove from wishlist
            set((state) => ({
              wishlistIds: state.wishlistIds.filter((id) => id !== productId),
            }));
          }

          return added;
        } catch (error) {
          console.error('Failed to toggle wishlist:', error);
          throw error;
        }
      },

      isInWishlist: (productId: string) => {
        return get().wishlistIds.includes(productId);
      },

      getCount: () => {
        return get().wishlistIds.length;
      },
    }),
    {
      name: 'sharesteak-wishlist',
    }
  )
);
