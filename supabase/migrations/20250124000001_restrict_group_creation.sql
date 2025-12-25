-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can create group purchases" ON public.group_purchases;

-- Create the new restricted policy
CREATE POLICY "Sellers and Admins can create group purchases"
ON public.group_purchases FOR INSERT
WITH CHECK (
  organizer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('SELLER', 'ADMIN')
  )
);
