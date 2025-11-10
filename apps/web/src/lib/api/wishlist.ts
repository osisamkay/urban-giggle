import { supabase } from '../supabase/client';

export const wishlistApi = {
  // Get user's wishlist with product details
  getUserWishlist: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        product:products (
          id,
          title,
          description,
          price,
          unit,
          category,
          images,
          inventory,
          status,
          average_rating,
          seller:seller_profiles (
            business_name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate entry error
      if (error.code === '23505') {
        throw new Error('Product already in wishlist');
      }
      throw error;
    }

    return data;
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  // Check if product is in wishlist
  isInWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Get wishlist count
  getWishlistCount: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;
    return count || 0;
  },

  // Toggle wishlist (add if not in wishlist, remove if in wishlist)
  toggleWishlist: async (productId: string) => {
    const isIn = await wishlistApi.isInWishlist(productId);

    if (isIn) {
      await wishlistApi.removeFromWishlist(productId);
      return false; // Removed
    } else {
      await wishlistApi.addToWishlist(productId);
      return true; // Added
    }
  },
};
