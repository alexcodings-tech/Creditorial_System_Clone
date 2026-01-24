-- Add CHECK constraint on projects.project_type to enforce only 3 allowed sectors
ALTER TABLE public.projects 
ADD CONSTRAINT projects_project_type_check 
CHECK (project_type IN ('Web Development', 'Digital Marketing', 'Content Creation'));