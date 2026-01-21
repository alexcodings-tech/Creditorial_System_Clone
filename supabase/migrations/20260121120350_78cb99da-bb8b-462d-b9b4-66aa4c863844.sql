-- Update RLS policy for credit_requests to block admin from creating requests
DROP POLICY IF EXISTS "Users can create their own credit requests " ON public.credit_requests;
CREATE POLICY "Non-admin users can create their own credit requests"
ON public.credit_requests
FOR INSERT
WITH CHECK (
  employee_id = auth.uid() 
  AND NOT is_admin()
);

-- Update RLS policy for mission_requests to block admin from creating requests
DROP POLICY IF EXISTS "Users can create their own mission requests " ON public.mission_requests;
CREATE POLICY "Non-admin users can create their own mission requests"
ON public.mission_requests
FOR INSERT
WITH CHECK (
  employee_id = auth.uid() 
  AND NOT is_admin()
);