import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { BadgeAchievement } from "@/components/ui/badge-achievement";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { CommonMissionsSection } from "@/components/missions/CommonMissionsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Coins, Target, TrendingUp, Zap, Loader2, Star, Award, Crown } from "lucide-react";
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

export default function EmployeeDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCredits, setTotalCredits] = useState(0);
  const { user, profile } = useAuth();
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
      .select("assignment_id, credits_requested")
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
    
    // Calculate total credits from approved credit_requests
    const creditTotal = (approvedCredits || []).reduce((sum, r) => sum + r.credits_requested, 0);
      
    // Also fetch approved mission_requests (cast to any for new table)
    const { data: approvedMissions } = await (supabase as any)
      .from("mission_requests")
      .select("credits_requested")
      .eq("employee_id", user.id)
      .eq("status", "approved");
    
    const missionTotal = ((approvedMissions as any[]) || []).reduce((sum: number, r: any) => sum + r.credits_requested, 0);
    setTotalCredits(creditTotal + missionTotal);
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

  const activeProjects = assignments.filter((a) => a.status === "in_progress").length;
  const completedProjects = assignments.filter((a) => a.status === "completed").length;
  const progressPercentage = Math.min(Math.round((totalCredits / 100) * 100), 100);

  // Achievements based on progress
  const achievements = [
    { id: "1", title: "First Mission", description: "Complete your first project", icon: Star, variant: completedProjects > 0 ? "gold" as const : "locked" as const },
    { id: "2", title: "Credit Hunter", description: "Earn 50 credits", icon: Coins, variant: totalCredits >= 50 ? "gold" as const : "locked" as const },
    { id: "3", title: "Streak Master", description: "7-day login streak", icon: Zap, variant: "locked" as const },
  ];

  return (
    <DashboardLayout role="employee">
      <div className="space-y-8">
        {/* Header Row: Profile + Progress */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProfileCard
              name={profile?.full_name || "Employee"}
              role={profile?.role || "employee"}
              avatar={profile?.avatar_url || undefined}
              rank={1}
              previousRank={1}
            />
          </div>

          {/* Monthly Progress Ring */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Progress</h3>
            <ProgressRing progress={progressPercentage} size={120} strokeWidth={10} showPercentage={false} />
            <p className="text-sm text-muted-foreground mt-4">
              <span className="font-bold text-foreground">{totalCredits}</span> / 100 credits
            </p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Credits"
            value={totalCredits}
            icon={Coins}
            variant="primary"
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={Target}
          />
          <StatCard
            title="Completed"
            value={completedProjects}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="This Week"
            value={Math.min(totalCredits, 25)}
            subtitle="of 25 weekly goal"
            icon={Zap}
            variant="accent"
          />
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-xl font-bold font-display text-foreground mb-6">Achievements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <BadgeAchievement
                key={achievement.id}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                variant={achievement.variant}
              />
            ))}
          </div>
        </div>

        {/* Common Missions */}
        <CommonMissionsSection />

        {/* My Project Missions */}
        <div>
          <h2 className="text-xl font-bold font-display text-foreground mb-6">My Project Missions</h2>
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
      </div>
    </DashboardLayout>
  );
}
