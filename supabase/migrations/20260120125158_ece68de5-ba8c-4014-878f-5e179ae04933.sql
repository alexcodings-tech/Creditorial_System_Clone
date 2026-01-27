-- =============================================
-- COMMON MISSIONS TABLE (Master list of predefined missions)
-- =============================================
CREATE TABLE public.common_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_name TEXT NOT NULL,
  mission_description TEXT,
  default_credit_value INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.common_missions ENABLE ROW LEVEL SECURITY;

-- Everyone can view active missions
CREATE POLICY "Everyone can view missions"
  ON public.common_missions FOR SELECT
  USING (true);

-- Only admins can manage missions
CREATE POLICY "Admins can insert missions"
  ON public.common_missions FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update missions"
  ON public.common_missions FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete missions"
  ON public.common_missions FOR DELETE
  USING (is_admin());

-- =============================================
-- MISSION REQUESTS TABLE (Employee submissions for mission credits)
-- =============================================
CREATE TABLE public.mission_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.common_missions(id) ON DELETE CASCADE,
  credits_requested INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mission_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests, admins/leads see all
CREATE POLICY "Users can view own mission requests or admins/leads see all"
  ON public.mission_requests FOR SELECT
  USING ((employee_id = auth.uid()) OR is_lead_or_admin());

-- Users can create their own mission requests
CREATE POLICY "Users can create their own mission requests"
  ON public.mission_requests FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Admins and leads can update mission requests (for approval)
CREATE POLICY "Admins and leads can update mission requests"
  ON public.mission_requests FOR UPDATE
  USING (is_lead_or_admin());

-- Trigger for updated_at
CREATE TRIGGER update_mission_requests_updated_at
  BEFORE UPDATE ON public.mission_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- ADD source_type TO credit_requests TABLE (Optional - to distinguish source)
-- =============================================
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'task';
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS mission_id UUID REFERENCES public.common_missions(id);

-- =============================================
-- INSERT DEFAULT COMMON MISSIONS
-- =============================================
INSERT INTO public.common_missions (mission_name, mission_description, default_credit_value) VALUES
  ('Make a Purchase', 'Earn points for completing any purchase', 10),
('Big Purchase Bonus', 'Earn bonus points for purchases over ₹1000', 50),
('Refer a Friend', 'Earn points when a referred friend makes a purchase', 150),
('First-Time Bonus', 'Welcome bonus for new customer registration', 100),
('Spend Over ₹1000', 'Extra points for crossing ₹1000 in a single bill', 50),
('View Bill History', 'View and track your past purchase history', 5),
('Monthly Shopper', 'Earn points for spending ₹5000 or more in a month', 200),
('Birthday Bonus', 'Special bonus points on your birthday', 200);
