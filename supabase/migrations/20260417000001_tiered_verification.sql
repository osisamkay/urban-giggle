-- Sprint 1: The Tiered Identity System
-- Adding verification levels and KYC status to seller profiles

-- 1. Create the Verification Level Enum
CREATE TYPE verification_level AS ENUM ('BASIC', 'VERIFIED', 'PLATINUM');
CREATE TYPE kyc_status AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- 2. Update Seller Profiles Table
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS verification_level verification_level DEFAULT 'BASIC',
ADD COLUMN IF NOT EXISTS kyc_status kyc_status DEFAULT 'NOT_STARTED',
ADD COLUMN IF NOT EXISTS kyc_documents JSONB DEFAULT '[]'::jsonb;

-- 3. Implement RLS Guard for Group Creation
-- We want to ensure that a BASIC seller cannot create a group that is too expensive
-- This is a 'Check' constraint simulated via a function for RLS
CREATE OR REPLACE FUNCTION check_group_value_limit(p_seller_id UUID, p_target_value DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    v_level verification_level;
BEGIN
    SELECT verification_level INTO v_level 
    FROM public.seller_profiles 
    WHERE id = p_seller_id;

    -- BASIC sellers are capped at $1,000 total group value
    IF v_level = 'BASIC' AND p_target_value > 1000 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply the RLS Policy to group_purchases
-- Note: We drop the existing one first to avoid duplicates
DROP POLICY IF EXISTS "Sellers can create groups" ON public.group_purchases;

CREATE POLICY "Sellers can create groups with value limits" 
ON public.group_purchases
FOR INSERT 
WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'SELLER' 
    AND 
    check_group_value_limit(
        (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()), 
        (SELECT (target_quantity * (price_tiers->0->>'price_per_unit')::numeric) FROM public.group_purchases WHERE id = id) -- Simplified for logic
    )
);

COMMENT ON COLUMN public.seller_profiles.verification_level IS 'Trust tier: BASIC (limited), VERIFIED (standard), PLATINUM (partner)';
COMMENT ON COLUMN public.seller_profiles.kyc_status IS 'The current state of the KYC document review process';
