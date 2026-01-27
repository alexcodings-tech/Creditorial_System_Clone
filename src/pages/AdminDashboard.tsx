import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  FolderKanban,
  Coins,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  Loader2,
} from "lucide-react";

interface CreditRequest {
  id: string;
  credits_requested: number;
  status: string;
  created_at: string;
  employee_id: string;
  employee_name?: string;
  project_name?: string;
}

interface Performer {
  id: string;
  name: string;
  role: string;
  credits: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    creditsDistributed: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<CreditRequest[]>([]);
  const [topPerformers, setTopPerformers] = useState<Performer[]>([]);
  const [lowPerformers, setLowPerformers] = useState<Performer[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch employee count
      const { count: employeeCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["employee", "lead"]);

      // Fetch active projects count
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch pending approvals count
      const { count: pendingCount, data: pendingData } = await supabase
        .from("credit_requests")
        .select("*")
        .eq("status", "pending");

      // Enrich pending requests with employee and project names
      const enrichedRequests: CreditRequest[] = [];
      for (const request of (pendingData || []).slice(0, 5)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", request.employee_id)
          .single();

        const { data: assignment } = await supabase
          .from("project_assignments")
          .select("project_id")
          .eq("id", request.assignment_id)
          .single();

        let projectName = "Unknown";
        if (assignment) {
          const { data: project } = await supabase
            .from("projects")
            .select("name")
            .eq("id", assignment.project_id)
            .single();
          projectName = project?.name || "Unknown";
        }

        enrichedRequests.push({
          ...request,
          employee_name: profile?.full_name || "Unknown",
          project_name: projectName,
        });
      }
      setPendingRequests(enrichedRequests);

      // Fetch total distributed credits
      const { data: approvedCredits } = await supabase
        .from("credit_requests")
        .select("credits_requested")
        .eq("status", "approved");

      const totalCredits = (approvedCredits || []).reduce(
        (sum, r) => sum + r.credits_requested,
        0
      );

      // Fetch performer data
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["employee", "lead"]);

      const performersWithCredits: Performer[] = await Promise.all(
        (profiles || []).map(async (p) => {
          const { data: requests } = await supabase
            .from("credit_requests")
            .select("credits_requested")
            .eq("employee_id", p.id)
            .eq("status", "approved");

          const credits = (requests || []).reduce(
            (sum, r) => sum + r.credits_requested,
            0
          );

          return {
            id: p.id,
            name: p.full_name,
            role: p.role,
            credits,
          };
        })
      );

      // Sort by credits
      const sorted = [...performersWithCredits].sort((a, b) => b.credits - a.credits);
      setTopPerformers(sorted.slice(0, 3));
      setLowPerformers(sorted.filter((p) => p.credits < 50).slice(0, 2));

      setStats({
        totalEmployees: employeeCount || 0,
        activeProjects: projectCount || 0,
        pendingApprovals: pendingCount || 0,
        creditsDistributed: totalCredits,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    const { error } = await supabase
      .from("credit_requests")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${approved ? "approve" : "reject"} request`,
        variant: "destructive",
      });
    } else {
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Credit request has been ${approved ? "approved" : "rejected"}`,
      });
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage Customers, visits, and approvals</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => navigate("/admin/employees")}
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
            {/* <Button 
              className="gap-2 gradient-primary text-primary-foreground shadow-glow"
              onClick={() => navigate("/admin/projects")}
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button> */}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={stats.totalEmployees}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active Customers"
            value={stats.activeProjects}
            icon={FolderKanban}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={AlertCircle}
            variant="accent"
          />
          <StatCard
            title="Credits Distributed"
            value={stats.creditsDistributed}
            subtitle="this month"
            icon={Coins}
            variant="success"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Approvals */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display text-foreground">Pending Approvals</h2>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {pendingRequests.length} pending
              </Badge>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{request.employee_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {request.credits_requested} credits
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.project_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleApproval(request.id, false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-success hover:bg-success/90"
                        onClick={() => handleApproval(request.id, true)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate("/admin/approvals")}
            >
              View All Approvals
            </Button>
          </div>

          {/* Performance Overview */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-success" />
                <h2 className="text-xl font-bold font-display text-foreground">Top Performers</h2>
              </div>

              {topPerformers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {topPerformers.map((performer) => (
                    <div key={performer.id} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                        {performer.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{performer.name}</p>
                          <span className="text-sm font-bold text-foreground">{performer.credits}</span>
                        </div>
                        <Progress value={Math.min(performer.credits, 100)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Needs Attention */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h2 className="text-xl font-bold font-display text-foreground">Needs Attention</h2>
              </div>

              {lowPerformers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Everyone is performing well!</p>
              ) : (
                <div className="space-y-4">
                  {lowPerformers.map((performer) => (
                    <div key={performer.id} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                        {performer.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{performer.name}</p>
                          <span className="text-sm font-bold text-warning">{performer.credits}</span>
                        </div>
                        <Progress value={performer.credits} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
