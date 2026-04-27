-- Table to track cumulative savings and impact metrics for buyers
CREATE TABLE IF NOT EXISTS buyer_savings_vault (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_saved DECIMAL DEFAULT 0,
    total_spent DECIMAL DEFAULT 0,
    groups_joined INTEGER DEFAULT 0,
    carbon_offset_kg DECIMAL DEFAULT 0, -- Simulated impact metric
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE buyer_savings_vault ENABLE ROW LEVEL SECURITY;

-- Users can only view their own savings
CREATE POLICY "Users can view own savings vault" 
ON buyer_savings_vault FOR SELECT 
USING (auth.uid() = user_id);

-- A service role or trigger can update the vault
CREATE POLICY "System can update savings vault" 
ON buyer_savings_vault FOR ALL 
USING (true) 
WITH CHECK (true);

-- Function to update savings when an order is completed
CREATE OR REPLACE FUNCTION update_buyer_savings()
RETURNS TRIGGER AS $$
DECLARE
    saved_amount DECIMAL;
BEGIN
    -- Calculate savings: (Original Price - Group Price) * Quantity
    -- This assumes we have original_price stored in the product/group table
    SELECT (g.original_price - g.group_price) * o.quantity 
    INTO saved_amount
    FROM group_purchasesg
    WHERE g.id = NEW.group_id;

    INSERT INTO buyer_savings_vault (user_id, total_saved, total_spent, groups_joined, carbon_offset_kg, last_updated)
    VALUES (
        NEW.user_id, 
        saved_amount, 
        NEW.total_amount, 
        1, 
        (NEW.quantity * 0.5), -- Simulated: 0.5kg carbon saved per kg bought collectively
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_saved = buyer_savings_vault.total_saved + saved_amount,
        total_spent = buyer_savings_vault.total_spent + NEW.total_amount,
        groups_joined = buyer_savings_vault.groups_joined + 1,
        carbon_offset_kg = buyer_savings_vault.carbon_offset_kg + (NEW.quantity * 0.5),
        last_updated = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vault when an order is marked as 'DELIVERED' or 'COMPLETED'
CREATE TRIGGER trigger_update_savings
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status != 'DELIVERED' AND NEW.status = 'DELIVERED')
EXECUTE FUNCTION update_buyer_savings();
