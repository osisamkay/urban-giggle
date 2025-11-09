-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Public can view basic user info"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Allow user creation during signup"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Addresses policies
CREATE POLICY "Users can view their own addresses"
    ON public.addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses"
    ON public.addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
    ON public.addresses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
    ON public.addresses FOR DELETE
    USING (auth.uid() = user_id);

-- Seller profiles policies
CREATE POLICY "Anyone can view seller profiles"
    ON public.seller_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own seller profile"
    ON public.seller_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile"
    ON public.seller_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (status = 'ACTIVE' OR seller_id IN (
        SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Sellers can create products"
    ON public.products FOR INSERT
    WITH CHECK (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Sellers can update their own products"
    ON public.products FOR UPDATE
    USING (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Sellers can delete their own products"
    ON public.products FOR DELETE
    USING (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    );

-- Orders policies
CREATE POLICY "Users can view their own orders as buyer"
    ON public.orders FOR SELECT
    USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view orders for their products"
    ON public.orders FOR SELECT
    USING (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their orders"
    ON public.orders FOR UPDATE
    USING (
        seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    );

-- Order items policies
CREATE POLICY "Users can view order items for their orders"
    ON public.order_items FOR SELECT
    USING (
        order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
        OR order_id IN (
            SELECT o.id FROM public.orders o
            JOIN public.seller_profiles sp ON o.seller_id = sp.id
            WHERE sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
    );

-- Group purchases policies
CREATE POLICY "Anyone can view active group purchases"
    ON public.group_purchases FOR SELECT
    USING (status = 'ACTIVE' OR organizer_id = auth.uid());

CREATE POLICY "Users can create group purchases"
    ON public.group_purchases FOR INSERT
    WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their group purchases"
    ON public.group_purchases FOR UPDATE
    USING (organizer_id = auth.uid());

-- Group participants policies
CREATE POLICY "Anyone can view group participants"
    ON public.group_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join groups"
    ON public.group_participants FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
    ON public.group_participants FOR DELETE
    USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (user_id = auth.uid());

-- Forum categories policies
CREATE POLICY "Anyone can view forum categories"
    ON public.forum_categories FOR SELECT
    USING (true);

-- Forum threads policies
CREATE POLICY "Anyone can view forum threads"
    ON public.forum_threads FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create threads"
    ON public.forum_threads FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own threads"
    ON public.forum_threads FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own threads"
    ON public.forum_threads FOR DELETE
    USING (author_id = auth.uid());

-- Forum replies policies
CREATE POLICY "Anyone can view forum replies"
    ON public.forum_replies FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create replies"
    ON public.forum_replies FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own replies"
    ON public.forum_replies FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own replies"
    ON public.forum_replies FOR DELETE
    USING (author_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations they participate in"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = ANY(participants));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can send messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM public.conversations WHERE auth.uid() = ANY(participants)
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
    ON public.payment_methods FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payment methods"
    ON public.payment_methods FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
    ON public.payment_methods FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods"
    ON public.payment_methods FOR DELETE
    USING (user_id = auth.uid());

-- Note: Admin policies are removed to prevent infinite recursion
-- Instead, use service role key for admin operations or create a separate admin schema
