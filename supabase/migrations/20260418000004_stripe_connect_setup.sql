-- Add stripe_account_id to profiles to support Stripe Connect
ALTER TABLE seller_profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;

-- Add platform_fee_percentage to a new global settings table for easy adjustment
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set initial platform fee to 5%
INSERT INTO platform_settings (key, value) 
VALUES ('platform_fee_percentage', '5') 
ON CONFLICT (key) DO NOTHING;
