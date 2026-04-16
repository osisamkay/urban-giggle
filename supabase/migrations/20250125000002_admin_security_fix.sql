-- Secure Admin Check Function to prevent RLS recursion
-- This function runs with SECURITY DEFINER to bypass RLS on the users table lookup
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin Policies for Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_admin());

-- Admin Policies for Order Items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (is_admin());

-- Admin Policies for Products (including inactive)
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT USING (is_admin());

-- Admin Policies for Seller Profiles
DROP POLICY IF EXISTS "Admins can update any seller profile" ON public.seller_profiles;
CREATE POLICY "Admins can update any seller profile" ON public.seller_profiles FOR UPDATE USING (is_admin());

-- Admin Policies for Users (for viewing all users in admin panel)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_admin());
