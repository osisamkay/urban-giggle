-- Function to update group purchase quantities
CREATE OR REPLACE FUNCTION update_group_quantities(p_group_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.group_purchases
    SET
        current_quantity = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM public.group_participants
            WHERE group_id = p_group_id
        ),
        participant_count = (
            SELECT COUNT(*)
            FROM public.group_participants
            WHERE group_id = p_group_id
        )
    WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment category thread count
CREATE OR REPLACE FUNCTION increment_category_threads(p_category_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.forum_categories
    SET thread_count = thread_count + 1
    WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment thread replies
CREATE OR REPLACE FUNCTION increment_thread_replies(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.forum_threads
    SET
        reply_count = reply_count + 1,
        last_activity_at = NOW()
    WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        'BUYER',
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get seller analytics
CREATE OR REPLACE FUNCTION get_seller_analytics(p_seller_id UUID)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_orders INTEGER,
    average_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*)::INTEGER as total_orders,
        COALESCE(AVG(total), 0) as average_order_value
    FROM public.orders
    WHERE seller_id = p_seller_id
    AND status NOT IN ('CANCELLED', 'REFUNDED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
