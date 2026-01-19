import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

// Mock data
const mockStats = {
  totalEmployees: 8,
  activeProjects: 15,
  pendingApprovals: 6,
  creditsDistributed: 542,
};

const mockPendingApprovals = [
  {
    id: "1",
    employeeName: "Vignesh S",
    projectName: "Q1 Meta Campaign",
    credits: 12,
    submittedAt: "2025-01-18",
    status: "pending",
  },
  {
    id: "2",
    employeeName: "Rahul Sharma",
    projectName: "Brand Posters",
    credits: 8,
    submittedAt: "2025-01-17",
    status: "pending",
  },
  {
    id: "3",
    employeeName: "Anita Singh",
    projectName: "Blog Series",
    credits: 10,
    submittedAt: "2025-01-17",
    status: "pending",
  },
];

const mockTopPerformers = [
  { name: "Priya Kumar", role: "Senior DM", credits: 94, progress: 94 },
  { name: "Rahul Sharma", role: "Designer", credits: 88, progress: 88 },
  { name: "Anita Singh", role: "Content Writer", credits: 82, progress: 82 },
];

const mockBottomPerformers = [
  { name: "New Employee 1", role: "DM Executive", credits: 35, progress: 35 },
  { name: "New Employee 2", role: "Designer", credits: 42, progress: 42 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage employees, projects, and approvals</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
            <Button className="gap-2 gradient-primary text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={mockStats.totalEmployees}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Active Projects"
            value={mockStats.activeProjects}
            icon={FolderKanban}
          />
          <StatCard
            title="Pending Approvals"
            value={mockStats.pendingApprovals}
            icon={AlertCircle}
            variant="accent"
          />
          <StatCard
            title="Credits Distributed"
            value={mockStats.creditsDistributed}
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
                {mockPendingApprovals.length} pending
              </Badge>
            </div>

            <div className="space-y-4">
              {mockPendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{approval.employeeName}</p>
                      <Badge variant="outline" className="text-xs">
                        {approval.credits} credits
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{approval.projectName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {approval.submittedAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="h-8 w-8 p-0 bg-success hover:bg-success/90">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
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

              <div className="space-y-4">
                {mockTopPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                      {performer.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <span className="text-sm font-bold text-foreground">{performer.credits}</span>
                      </div>
                      <Progress value={performer.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h2 className="text-xl font-bold font-display text-foreground">Needs Attention</h2>
              </div>

              <div className="space-y-4">
                {mockBottomPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      {performer.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{performer.name}</p>
                        <span className="text-sm font-bold text-warning">{performer.credits}</span>
                      </div>
                      <Progress value={performer.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
