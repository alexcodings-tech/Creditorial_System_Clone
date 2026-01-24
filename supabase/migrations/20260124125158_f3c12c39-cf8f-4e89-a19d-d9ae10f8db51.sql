-- Create the activity-credits lookup table
CREATE TABLE public.activity_credits (
  activity TEXT PRIMARY KEY,
  credits INTEGER NOT NULL,
  sector TEXT NOT NULL CHECK (sector IN ('Web Development', 'Digital Marketing', 'Content Creation'))
);

-- Insert all activity credit mappings
INSERT INTO public.activity_credits (activity, credits, sector) VALUES
  -- Web Development
  ('Small Project', 15, 'Web Development'),
  ('Mid Project', 30, 'Web Development'),
  ('Big Project', 50, 'Web Development'),
  ('Bug Fix / Optimization', 10, 'Web Development'),
  ('Feature Enhancement', 20, 'Web Development'),
  ('Code Review / Support', 10, 'Web Development'),
  -- Digital Marketing
  ('New Client Onboarding', 35, 'Digital Marketing'),
  ('Monthly Client Handling', 30, 'Digital Marketing'),
  ('Campaign Execution', 25, 'Digital Marketing'),
  ('Lead Conversion Milestone', 15, 'Digital Marketing'),
  ('Client Retention Bonus', 20, 'Digital Marketing'),
  ('Client Upsell / Expansion', 15, 'Digital Marketing'),
  -- Content Creation
  ('Blog Article', 10, 'Content Creation'),
  ('Website Copy', 20, 'Content Creation'),
  ('Social Media Post Set', 10, 'Content Creation'),
  ('Video Script', 15, 'Content Creation'),
  ('Graphic Design Asset', 10, 'Content Creation'),
  ('Full Content Campaign', 30, 'Content Creation'),
  ('Content Strategy Plan', 25, 'Content Creation');

-- Enable RLS on activity_credits (read-only for all)
ALTER TABLE public.activity_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view activity credits"
ON public.activity_credits FOR SELECT
USING (true);

-- Add activity column to projects
ALTER TABLE public.projects ADD COLUMN activity TEXT;

-- Add foreign key constraint to ensure valid activities
ALTER TABLE public.projects 
ADD CONSTRAINT projects_activity_fk 
FOREIGN KEY (activity) REFERENCES public.activity_credits(activity);

-- Create trigger function to auto-calculate expected_credits from activity
CREATE OR REPLACE FUNCTION public.auto_calculate_project_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activity IS NOT NULL THEN
    SELECT credits INTO NEW.expected_credits
    FROM public.activity_credits
    WHERE activity = NEW.activity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER auto_calculate_credits_on_insert
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_calculate_project_credits();

CREATE TRIGGER auto_calculate_credits_on_update
BEFORE UPDATE OF activity ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_calculate_project_credits();