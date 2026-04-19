-- Table for Group Promotions (Boosts)
CREATE TABLE IF NOT EXISTS group_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    boost_expires_at TIMESTAMPTZ NOT NULL,
    cost DECIMAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE group_promotions ENABLE ROW LEVEL SECURITY;

-- Everyone can see boosted groups to determine sort order
CREATE POLICY "Anyone can view promotions" 
ON group_promotions FOR SELECT 
USING (true);

-- Sellers can manage their own boosts
CREATE POLICY "Sellers can manage own boosts" 
ON group_promotions FOR ALL 
USING (auth.uid() = seller_id);

-- Update the group discovery view (simulated logic)
-- In a real environment, this would be a function or a modified query in the /api/groups endpoint
-- to SORT BY (SELECT count(*) FROM group_promotions WHERE group_id = groups.id AND boost_expires_at > now()) DESC
