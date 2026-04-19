-- Table to manage shipping providers and API configurations
CREATE TABLE IF NOT EXISTS shipping_providers (
    id TEXT PRIMARY KEY, -- 'easypost', 'shipstation', 'dhl'
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    config JSONB, -- Store API keys securely or references to secret manager
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table to track shipments for every order
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number TEXT,
    carrier TEXT,
    shipping_status TEXT DEFAULT 'LABEL_CREATED', -- 'LABEL_CREATED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'
    label_url TEXT,
    estimated_delivery TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Buyers can view tracking for their own orders
CREATE POLICY "Buyers can view own shipment tracking" 
ON shipments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = shipments.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Sellers can manage shipments for their groups
CREATE POLICY "Sellers can manage shipments for their products" 
ON shipments FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN groups g ON o.group_id = g.id
        WHERE o.id = shipments.order_id 
        AND g.seller_id = auth.uid()
    )
);

-- Seed default provider
INSERT INTO shipping_providers (id, name, is_active) 
VALUES ('easypost', 'EasyPost', true) 
ON CONFLICT (id) DO NOTHING;
