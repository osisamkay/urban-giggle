-- Atomic inventory decrement to prevent race conditions
-- Returns true if inventory was sufficient, false otherwise
CREATE OR REPLACE FUNCTION decrement_inventory(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current INTEGER;
BEGIN
    -- Lock the row and get current inventory
    SELECT inventory INTO v_current
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_current < p_quantity THEN
        RETURN FALSE;
    END IF;

    UPDATE public.products
    SET inventory = inventory - p_quantity
    WHERE id = p_product_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic inventory restore (for refunds)
CREATE OR REPLACE FUNCTION restore_inventory(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET inventory = inventory + p_quantity
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
