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

CREATE OR REPLACE VIEW public.top_3_users AS
SELECT
  p.id,
  p.full_name,
  p.email,
  COALESCE(SUM(pa.credits_earned), 0) AS total_credits,
  ROW_NUMBER() OVER (
    ORDER BY COALESCE(SUM(pa.credits_earned), 0) DESC
  ) AS rank
FROM public.profiles p
LEFT JOIN public.project_assignments pa
  ON pa.employee_id = p.id
GROUP BY p.id
ORDER BY total_credits DESC
LIMIT 3;


CREATE OR REPLACE FUNCTION public.redeem_gift()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rank INT;
  already_redeemed BOOLEAN;
BEGIN
  -- Check top 3
  SELECT rank INTO user_rank
  FROM public.top_3_users
  WHERE id = auth.uid();

  IF user_rank IS NULL THEN
    RETURN 'Not eligible for gift';
  END IF;

  -- Check redemption status
  SELECT gift_redeemed INTO already_redeemed
  FROM public.profiles
  WHERE id = auth.uid();

  IF already_redeemed THEN
    RETURN 'Gift already redeemed';
  END IF;

  -- Redeem
  UPDATE public.profiles
  SET gift_redeemed = TRUE
  WHERE id = auth.uid();

  RETURN '🎁 Gift redeemed successfully! Rank ' || user_rank;
END;
$$;
