-- Enhanced Seller Analytics for Time-Series Data
CREATE OR REPLACE FUNCTION get_seller_revenue_timeseries(p_seller_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    day DATE,
    revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc('day', created_at)::DATE as day,
        SUM(total) as revenue
    FROM public.orders
    WHERE seller_id = p_seller_id
    AND status = 'CONFIRMED'
    AND created_at > CURRENT_DATE - p_days
    GROUP BY 1
    ORDER BY 1 ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Product Stock Alert Function
CREATE OR REPLACE FUNCTION get_low_stock_products(p_seller_id UUID, p_threshold INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title TEXT,
    inventory INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, p.inventory
    FROM public.products p
    WHERE p.seller_id = p_seller_id
    AND p.inventory <= p_threshold
    ORDER BY p.inventory ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
