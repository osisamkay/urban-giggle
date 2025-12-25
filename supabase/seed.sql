-- ============================================================
-- SEED DATA FOR SHARESTEAK MARKETPLACE
-- ============================================================
-- This file adds seed data for development and testing
-- ============================================================

-- Temporarily disable RLS for seeding
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Clean existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.seller_profiles CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- ============================================================
-- SAMPLE USERS
-- ============================================================
-- Create sample users (these will be linked with Supabase Auth later)
INSERT INTO auth.users (id, email) VALUES
  ('10000000-0000-0000-0000-000000000001', 'seller1@sharesteak.com'),
  ('10000000-0000-0000-0000-000000000002', 'seller2@sharesteak.com'),
  ('10000000-0000-0000-0000-000000000003', 'buyer1@sharesteak.com'),
  ('10000000-0000-0000-0000-000000000004', 'admin@sharesteak.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, role, first_name, last_name, email_verified) VALUES
  ('10000000-0000-0000-0000-000000000001', 'seller1@sharesteak.com', 'SELLER', 'John', 'Ranch', true),
  ('10000000-0000-0000-0000-000000000002', 'seller2@sharesteak.com', 'SELLER', 'Mary', 'Farm', true),
  ('10000000-0000-0000-0000-000000000003', 'buyer1@sharesteak.com', 'BUYER', 'Bob', 'Customer', true),
  ('10000000-0000-0000-0000-000000000004', 'admin@sharesteak.com', 'ADMIN', 'Super', 'Admin', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SELLER PROFILES
-- ============================================================
INSERT INTO public.seller_profiles (id, user_id, business_name, description, location, rating, verified) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Premium Ranch Co', 'Family-owned ranch providing grass-fed beef since 1985', 'Montana, USA', 4.8, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Organic Farm Foods', 'Certified organic meats and poultry from sustainable farms', 'California, USA', 4.9, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SAMPLE PRODUCTS
-- ============================================================
INSERT INTO public.products (
  seller_id, title, description, category, price, unit, images, inventory, status, average_rating, review_count
) VALUES
  -- Beef Products
  (
    '20000000-0000-0000-0000-000000000001',
    'Premium Ribeye Steak',
    'USDA Prime ribeye, dry-aged 28 days for maximum flavor and tenderness',
    'BEEF',
    45.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1546833998-877b37c2e5c6'],
    50,
    'ACTIVE',
    4.8,
    42
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    'Grass-Fed Ground Beef',
    '100% grass-fed ground beef, perfect for burgers and tacos',
    'BEEF',
    12.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1588347818036-db69b37c5d9f'],
    100,
    'ACTIVE',
    4.6,
    87
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    'NY Strip Steak',
    'Tender New York strip steaks, cut to perfection',
    'BEEF',
    38.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1603073686956-333bdfc3f92d'],
    35,
    'ACTIVE',
    4.7,
    56
  ),

  -- Pork Products
  (
    '20000000-0000-0000-0000-000000000002',
    'Heritage Pork Chops',
    'Thick-cut heritage breed pork chops, incredibly flavorful',
    'PORK',
    18.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1602470520998-f4a52199a3d6'],
    40,
    'ACTIVE',
    4.9,
    31
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Applewood Smoked Bacon',
    'Thick-cut bacon smoked over applewood for 12 hours',
    'PORK',
    16.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1608898913041-bfee25c5c06e'],
    75,
    'ACTIVE',
    4.8,
    94
  ),

  -- Chicken Products
  (
    '20000000-0000-0000-0000-000000000002',
    'Free-Range Chicken Breast',
    'Organic, free-range chicken breast, never frozen',
    'CHICKEN',
    14.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1587593810167-a84920ea0781'],
    60,
    'ACTIVE',
    4.7,
    68
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Whole Organic Chicken',
    'Farm-raised organic chicken, perfect for roasting',
    'CHICKEN',
    8.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1604503468506-a8da13d82791'],
    45,
    'ACTIVE',
    4.6,
    52
  ),

  -- Lamb Products
  (
    '20000000-0000-0000-0000-000000000001',
    'Lamb Rack Chops',
    'Premium lamb rack chops, perfect for grilling',
    'LAMB',
    32.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1619740455993-a71612c45f29'],
    25,
    'ACTIVE',
    4.9,
    23
  ),

  -- Seafood Products
  (
    '20000000-0000-0000-0000-000000000002',
    'Wild-Caught Salmon',
    'Fresh Alaskan wild-caught salmon, rich in omega-3',
    'SEAFOOD',
    28.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1580959371409-9c6a9cb9d2b7'],
    30,
    'ACTIVE',
    4.8,
    45
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Atlantic Cod Fillets',
    'Fresh Atlantic cod fillets, wild-caught and sustainable',
    'SEAFOOD',
    22.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19'],
    40,
    'ACTIVE',
    4.6,
    38
  ),

  -- Game Meats
  (
    '20000000-0000-0000-0000-000000000001',
    'Venison Steaks',
    'Wild venison steaks, lean and flavorful',
    'GAME',
    34.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1607623814075-e51df1bdc82f'],
    15,
    'ACTIVE',
    4.7,
    19
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    'Wild Boar Sausage',
    'Artisan wild boar sausage with herbs and spices',
    'GAME',
    24.99,
    'lb',
    ARRAY['https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'],
    20,
    'ACTIVE',
    4.8,
    27
  );

-- ============================================================
-- RE-ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Seed data complete!
-- Database is now populated with sample products for testing
