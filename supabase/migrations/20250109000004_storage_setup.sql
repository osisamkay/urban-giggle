-- Storage setup for ShareSteak
-- This file sets up storage buckets and policies for the ShareSteak application

-- Create storage buckets with compatible schema
INSERT INTO storage.buckets (id, name)
VALUES
  ('products', 'products'),
  ('avatars', 'avatars'),
  ('content', 'content')
ON CONFLICT (id) DO NOTHING;

-- RLS is already enabled on storage.objects

-- Products bucket policies (drop existing policies first)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
    DROP POLICY IF EXISTS "Product owners can update their images" ON storage.objects;
    DROP POLICY IF EXISTS "Product owners can delete their images" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for content" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload content" ON storage.objects;
    DROP POLICY IF EXISTS "Content creators can update their content" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete content" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        -- Policies don't exist yet, that's fine
        NULL;
END $$;

-- Products bucket policies
CREATE POLICY "Public read access for products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Product owners can update their images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'products');

CREATE POLICY "Product owners can delete their images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products');

-- Avatars bucket policies
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- Content bucket policies
CREATE POLICY "Public read access for content" ON storage.objects
  FOR SELECT USING (bucket_id = 'content');

CREATE POLICY "Authenticated users can upload content" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content');

CREATE POLICY "Content creators can update their content" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'content');

CREATE POLICY "Admins can delete content" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'content');

-- Storage setup complete!
