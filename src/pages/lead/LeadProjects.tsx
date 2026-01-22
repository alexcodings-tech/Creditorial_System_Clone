import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Loader2 } from "lucide-react";

interface Assignee {
  id: string;
  full_name: string;
}

interface Project {
  id: string;
  name: string;
  client_name: string | null;
  project_type: string;
  status: string;
  end_date: string | null;
  expected_credits: number;
  assignees: Assignee[];
}

export default function LeadProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
        return;
      }

      // Get assignee names for each project
      const projectsWithAssignees = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: assignments } = await supabase
            .from("project_assignments")
            .select("employee_id")
            .eq("project_id", project.id);

          const employeeIds = assignments?.map(a => a.employee_id) || [];
          
          let assignees: Assignee[] = [];
          if (employeeIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", employeeIds);
            
            assignees = (profiles || []).map(p => ({
              id: p.id,
              full_name: p.full_name
            }));
          }

          return {
            ...project,
            assignees,
          };
        })
      );

      setProjects(projectsWithAssignees);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/30";
      case "completed":
        return "bg-primary/10 text-primary border-primary/30";
      case "on_hold":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="lead">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="lead">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">View and manage team projects</p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No projects found
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-border bg-card p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.client_name || "No client"}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary">{project.project_type}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Assignees
                    </span>
                    <span className="font-medium text-right max-w-[150px] truncate" title={project.assignees.map(a => a.full_name).join(", ")}>
                      {project.assignees.length === 0 
                        ? "None" 
                        : project.assignees.length <= 2 
                          ? project.assignees.map(a => a.full_name).join(", ")
                          : `${project.assignees.slice(0, 2).map(a => a.full_name).join(", ")} +${project.assignees.length - 2} more`
                      }
                    </span>
                  </div>

                  {project.end_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due Date
                      </span>
                      <span className="font-medium">
                        {new Date(project.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-bold text-primary">{project.expected_credits}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
