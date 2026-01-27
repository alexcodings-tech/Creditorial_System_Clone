import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Assignment {
  id: string;
  project_id: string;
  status: string;
  progress: number;
  credits_earned: number;
  has_approved_credit: boolean;
  project: {
    id: string;
    name: string;
    client_name: string | null;
    project_type: string;
    expected_credits: number;
    end_date: string | null;
  };
}

export default function EmployeeProjects() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("project_assignments")
      .select(`
        id,
        project_id,
        status,
        progress,
        credits_earned,
        project:projects(id, name, client_name, project_type, expected_credits, end_date)
      `)
      .eq("employee_id", user.id);

    if (error) {
      console.error("Error fetching assignments:", error);
      setLoading(false);
      return;
    }

    // Fetch approved credit requests to check which assignments already have credits
    const { data: approvedCredits } = await supabase
      .from("credit_requests")
      .select("assignment_id")
      .eq("employee_id", user.id)
      .eq("status", "approved");

    const approvedAssignmentIds = new Set(
      (approvedCredits || []).map((cr) => cr.assignment_id)
    );

    const formattedData = (data || []).map((item: any) => ({
      ...item,
      project: item.project,
      has_approved_credit: approvedAssignmentIds.has(item.id),
    }));
    setAssignments(formattedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("project_assignments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Project status updated to ${newStatus}`,
      });
      fetchAssignments();
    }
  };

  const handleRequestCredit = async (id: string) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment || !user) return;

    // Block credit requests for completed projects that already have approved credits
    if (assignment.has_approved_credit) {
      toast({
        title: "Already Credited",
        description: "This project has already received approved credits",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("credit_requests").insert({
      assignment_id: id,
      employee_id: user.id,
      credits_requested: assignment.project.expected_credits,
      notes: `Credit request for ${assignment.project.name}`,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit credit request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Submitted",
        description: "Your credit request has been submitted for approval",
      });
      fetchAssignments(); // Refresh to update UI
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="employee">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employee">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">My Visits</h1>
          <p className="text-muted-foreground mt-1">View and manage your assigned projects</p>
        </div>

        {/* Projects */}
        {assignments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No projects assigned yet. Contact your admin or lead.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assignments.map((assignment) => (
              <MissionCard
                key={assignment.id}
                id={assignment.id}
                projectName={assignment.project.name}
                clientName={assignment.project.client_name || "No Client"}
                projectType={assignment.project.project_type}
                status={assignment.status}
                expectedCredits={assignment.project.expected_credits}
                dueDate={assignment.project.end_date || undefined}
                progress={assignment.progress}
                onUpdateStatus={handleUpdateStatus}
                onRequestCredit={handleRequestCredit}
                hasApprovedCredit={assignment.has_approved_credit}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
