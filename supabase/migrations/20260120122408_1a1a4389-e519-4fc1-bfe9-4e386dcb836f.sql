-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'lead', 'employee');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  project_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  expected_credits INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project assignments table
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

-- Create credit_requests table for approvals
CREATE TABLE public.credit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.project_assignments(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_requested INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Create helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- Create helper function to check if user is lead or admin
CREATE OR REPLACE FUNCTION public.is_lead_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'lead')
  )
$$;

-- Create helper function to check if user is assigned to project
CREATE OR REPLACE FUNCTION public.is_assigned_to_project(project_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_assignments
    WHERE project_assignments.project_id = is_assigned_to_project.project_id
      AND employee_id = auth.uid()
  )
$$;

-- PROFILES RLS Policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR id = auth.uid());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- PROJECTS RLS Policies
CREATE POLICY "Admins and leads can view all projects" ON public.projects
  FOR SELECT TO authenticated
  USING (public.is_lead_or_admin() OR public.is_assigned_to_project(id));

CREATE POLICY "Admins and leads can create projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "Admins and leads can update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.is_lead_or_admin());

CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- PROJECT_ASSIGNMENTS RLS Policies
CREATE POLICY "Users can view own assignments or admins/leads see all" ON public.project_assignments
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.is_lead_or_admin());

CREATE POLICY "Admins and leads can create assignments" ON public.project_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_lead_or_admin());

CREATE POLICY "Users can update own assignments or admins/leads update all" ON public.project_assignments
  FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR public.is_lead_or_admin());

CREATE POLICY "Admins can delete assignments" ON public.project_assignments
  FOR DELETE TO authenticated
  USING (public.is_lead_or_admin());

-- CREDIT_REQUESTS RLS Policies
CREATE POLICY "Users can view own requests or admins/leads see all" ON public.credit_requests
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.is_lead_or_admin());

CREATE POLICY "Users can create their own credit requests" ON public.credit_requests
  FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins and leads can update credit requests" ON public.credit_requests
  FOR UPDATE TO authenticated
  USING (public.is_lead_or_admin());

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON public.project_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();