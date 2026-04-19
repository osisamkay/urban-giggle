-- Table for dispute management
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Buyers can create disputes for their own orders
CREATE POLICY "Buyers can create disputes" 
ON disputes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Buyers can view their own disputes
CREATE POLICY "Buyers can view own disputes" 
ON disputes FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can manage all disputes
CREATE POLICY "Admins can manage all disputes" 
ON disputes FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'ADMIN'
    )
);

-- Table for referral tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral stats
CREATE POLICY "Users can view own referrals" 
ON referrals FOR SELECT 
USING (auth.uid() = referrer_id);

-- System can insert referrals
CREATE POLICY "System can insert referrals" 
ON referrals FOR INSERT 
WITH CHECK (true);
