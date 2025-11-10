-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create index for faster lookups
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- Add RLS policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add items to their wishlist
CREATE POLICY "Users can add to their wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove items from their wishlist
CREATE POLICY "Users can remove from their wishlist"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get wishlist count for a user
CREATE OR REPLACE FUNCTION get_wishlist_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM wishlists
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if product is in wishlist
CREATE OR REPLACE FUNCTION is_in_wishlist(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM wishlists
    WHERE user_id = p_user_id AND product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
