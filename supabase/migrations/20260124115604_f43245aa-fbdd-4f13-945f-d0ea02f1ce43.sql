-- Add sector column to profiles for role-based project assignment
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sector text CHECK (sector IN ('Web Development', 'Digital Marketing', 'Content Creation'));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.sector IS 'Employee sector for role-based project assignment: Web Development, Digital Marketing, or Content Creation';