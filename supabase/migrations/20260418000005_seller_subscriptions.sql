-- Create table for Tiered Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY, -- 'BASIC', 'VERIFIED', 'PLATINUM'
    name TEXT NOT NULL,
    monthly_price DECIMAL NOT NULL,
    value_limit DECIMAL NOT NULL, -- Max total value of groups they can host
    priority_level INTEGER DEFAULT 0,
    features JSONB -- Store feature flags like { "can_boost": true, "analytics_access": true }
);

-- Seed the plans
INSERT INTO subscription_plans (id, name, monthly_price, value_limit, priority_level, features)
VALUES 
('BASIC', 'Basic Seller', 0, 1000, 0, '{"can_boost": false, "analytics_access": false}'),
('VERIFIED', 'Verified Seller', 29.99, 10000, 1, '{"can_boost": true, "analytics_access": true}'),
('PLATINUM', 'Platinum Seller', 99.99, 100000, 2, '{"can_boost": true, "analytics_access": true, "priority_support": true}')
ON CONFLICT (id) DO NOTHING;

-- Add subscription_status and subscription_end_date to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'BASIC' REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create a view for Admin to see total subscription revenue
CREATE OR REPLACE VIEW admin_subscription_revenue AS
SELECT 
    p.subscription_tier,
    COUNT(*) as seller_count,
    SUM(sp.monthly_price) as monthly_recurring_revenue
FROM profiles p
JOIN subscription_plans sp ON p.subscription_tier = sp.id
WHERE p.subscription_end_date > now()
GROUP BY p.subscription_tier;
