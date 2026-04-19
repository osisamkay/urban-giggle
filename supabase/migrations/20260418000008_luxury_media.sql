-- Table for product media assets (Videos, 360 views, High-res galleries)
CREATE TABLE IF NOT EXISTS product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL, -- 'VIDEO', 'IMAGE_360', 'GALLERY_IMAGE'
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- Public can view product media
CREATE POLICY "Public can view product media" 
ON product_media FOR SELECT 
USING (true);

-- Sellers can manage media for their products
CREATE POLICY "Sellers can manage their product media" 
ON product_media FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_media.product_id 
        AND products.seller_id = auth.uid()
    )
);

-- Add quality certification tags to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS quality_certification TEXT, -- e.g., 'USDA Prime', 'A5 Kobe', 'Halal'
ADD COLUMN IF NOT EXISTS certification_url TEXT;
