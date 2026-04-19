-- Create Seller Analytics table to store snapshots of group performance
CREATE TABLE IF NOT EXISTS seller_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    joins INTEGER DEFAULT 0,
    revenue DECIMAL DEFAULT 0,
    status TEXT, -- 'ACTIVE', 'FILLED', 'EXPIRED'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE seller_analytics ENABLE ROW LEVEL SECURITY;

-- Sellers can manage their own analytics
CREATE POLICY "Sellers can manage own analytics" 
ON seller_analytics FOR ALL 
USING (auth.uid() = seller_id);

-- Create a function to track group views (called from the API)
CREATE OR REPLACE FUNCTION track_group_view(target_group_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO seller_analytics (seller_id, group_id, views)
    SELECT seller_id, id, 1 
    FROM groups 
    WHERE id = target_group_id
    ON CONFLICT (group_id) 
    DO UPDATE SET views = seller_analytics.views + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create a view for the Revenue Velocity chart
CREATE OR REPLACE VIEW seller_revenue_velocity AS
SELECT 
    date_trunc('day', updated_at) as day,
    SUM(revenue) as daily_revenue,
    COUNT(DISTINCT group_id) as groups_filled
FROM seller_analytics
WHERE status = 'FILLED'
GROUP BY 1
ORDER BY 1 DESC;
