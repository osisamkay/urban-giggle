-- Create Demand Signals table to track user intent for products that don't exist or aren't currently in a group
CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_category TEXT NOT NULL,
    requested_product_name TEXT NOT NULL,
    estimated_quantity DECIMAL NOT NULL,
    region TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;

-- Users can create their own demand signals
CREATE POLICY "Users can create demand signals" 
ON demand_signals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own signals
CREATE POLICY "Users can view own demand signals" 
ON demand_signals FOR SELECT 
USING (auth.uid() = user_id);

-- Sellers can view all demand signals to identify market gaps
CREATE POLICY "Sellers can view all demand signals" 
ON demand_signals FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'SELLER'
    )
);

-- Create a view for Sellers to see aggregated demand
CREATE OR REPLACE VIEW seller_demand_summary AS
SELECT 
    requested_product_name,
    product_category,
    region,
    COUNT(*) as total_requests,
    SUM(estimated_quantity) as total_requested_quantity,
    MAX(created_at) as last_requested_at
FROM demand_signals
GROUP BY requested_product_name, product_category, region;
