import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  FolderKanban,
  Coins,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface TeamMember {
  id: string;
  full_name: string;
  credits_earned: number;
}

export default function LeadDashboard() {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all employees (simplified - in real app would filter by team)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "employee");

      // Fetch project count
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (profiles) {
        // Get credits for each member
        const membersWithCredits = await Promise.all(
          profiles.map(async (p) => {
            const { data: assignments } = await supabase
              .from("project_assignments")
              .select("credits_earned")
              .eq("employee_id", p.id);

            const totalCredits = assignments?.reduce((sum, a) => sum + (a.credits_earned || 0), 0) || 0;
            return {
              id: p.id,
              full_name: p.full_name,
              credits_earned: totalCredits,
            };
          })
        );
        setTeamMembers(membersWithCredits);
      }

      setProjectCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalTeamCredits = teamMembers.reduce((sum, m) => sum + m.credits_earned, 0);

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Welcome, {profile?.full_name}
          </h1>
          <p className="text-muted-foreground mt-1">Lead Dashboard - Team Overview</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Team Members"
            value={teamMembers.length}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active Projects"
            value={projectCount}
            icon={FolderKanban}
          />
          <StatCard
            title="Team Credits"
            value={totalTeamCredits}
            subtitle="this month"
            icon={Coins}
            variant="success"
          />
          <StatCard
            title="Avg. Performance"
            value={teamMembers.length > 0 ? Math.round(totalTeamCredits / teamMembers.length) : 0}
            subtitle="credits per member"
            icon={TrendingUp}
            variant="accent"
          />
        </div>

        {/* Team Performance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-display text-foreground">Team Performance</h2>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-4">
              {teamMembers
                .sort((a, b) => b.credits_earned - a.credits_earned)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                      {member.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{member.full_name}</p>
                        <span className="text-sm font-bold text-foreground">
                          {member.credits_earned} credits
                        </span>
                      </div>
                      <Progress value={Math.min(member.credits_earned, 100)} className="h-2" />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
