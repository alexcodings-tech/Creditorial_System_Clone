import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  credits_earned: number;
  projects_count: number;
}

export default function LeadTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["employee", "lead"])
        .order("full_name");

      if (error) {
        console.error("Error fetching team:", error);
        setLoading(false);
        return;
      }

      // Enrich with project and credit data
      const enrichedMembers = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: assignments } = await supabase
            .from("project_assignments")
            .select("credits_earned")
            .eq("employee_id", profile.id);

          const totalCredits = assignments?.reduce((sum, a) => sum + (a.credits_earned || 0), 0) || 0;

          return {
            ...profile,
            credits_earned: totalCredits,
            projects_count: assignments?.length || 0,
          };
        })
      );

      setMembers(enrichedMembers);
      setLoading(false);
    };

    fetchTeam();
  }, []);

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
          <h1 className="text-3xl font-bold font-display text-foreground">Team</h1>
          <p className="text-muted-foreground mt-1">View team member performance</p>
        </div>

        {/* Team Grid */}
        {members.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No team members found
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-border bg-card p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                    {member.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{member.full_name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {member.role}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-semibold">{member.projects_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits Earned</span>
                    <span className="font-bold text-primary">{member.credits_earned}</span>
                  </div>
                  <div>
                    <Progress value={Math.min(member.credits_earned, 100)} className="h-2" />
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
