-- Fix: Default country should be 'Canada' not 'USA' (app is Calgary-based, uses CAD)
ALTER TABLE public.addresses ALTER COLUMN country SET DEFAULT 'Canada';

-- Update any existing 'USA' defaults that were never explicitly set
-- (Only updates rows where country is still the old default)
UPDATE public.addresses SET country = 'Canada' WHERE country = 'USA';
