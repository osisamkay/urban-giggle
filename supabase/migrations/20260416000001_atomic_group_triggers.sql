-- Atomic Group Quantity Triggers
-- This replaces the need for the SDK to call a recalculation RPC, 
-- eliminating race conditions and "Summation Lag".

-- Trigger for joining a group
CREATE OR REPLACE FUNCTION handle_group_join()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.group_purchases
    SET 
        current_quantity = current_quantity + NEW.quantity,
        participant_count = participant_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_group_join
    AFTER INSERT ON public.group_participants
    FOR EACH ROW EXECUTE FUNCTION handle_group_join();

-- Trigger for leaving a group
CREATE OR REPLACE FUNCTION handle_group_leave()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.group_purchases
    SET 
        current_quantity = current_quantity - OLD.quantity,
        participant_count = participant_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_group_leave
    AFTER DELETE ON public.group_participants
    FOR EACH ROW EXECUTE FUNCTION handle_group_leave();
