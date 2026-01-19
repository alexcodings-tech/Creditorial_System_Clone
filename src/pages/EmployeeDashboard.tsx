import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { BadgeAchievement } from "@/components/ui/badge-achievement";
import { Coins, Target, Calendar, Trophy, Zap, Award, Star, Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Mock data - will be replaced with real data from backend
const mockUser = {
  name: "Vignesh S",
  role: "Digital Marketing Executive",
  rank: 4,
  previousRank: 6,
};

const mockStats = {
  monthlyCredits: 67,
  lifetimeCredits: 1250,
  monthlyTarget: 100,
  completedProjects: 8,
  pendingCredits: 15,
};

const mockProjects = [
  {
    id: "1",
    projectName: "Q1 Meta Campaign",
    clientName: "Raji's Kitchen",
    projectType: "Meta Ads",
    status: "in_progress" as const,
    expectedCredits: 12,
    dueDate: "2025-01-25",
    progress: 65,
  },
  {
    id: "2",
    projectName: "Website SEO Optimization",
    clientName: "Enfance",
    projectType: "SEO",
    status: "ready_for_review" as const,
    expectedCredits: 8,
    dueDate: "2025-01-22",
  },
  {
    id: "3",
    projectName: "Social Media Strategy",
    clientName: "Zhar",
    projectType: "Content",
    status: "completed" as const,
    expectedCredits: 10,
    dueDate: "2025-01-20",
  },
  {
    id: "4",
    projectName: "Google Ads Setup",
    clientName: "New Client",
    projectType: "Meta Ads",
    status: "not_started" as const,
    expectedCredits: 15,
    dueDate: "2025-02-01",
  },
];

const mockAchievements = [
  { title: "First Project", icon: Star, variant: "gold" as const },
  { title: "10 Credits", icon: Coins, variant: "gold" as const },
  { title: "Week Streak", icon: Zap, variant: "silver" as const },
  { title: "Top 5", icon: Crown, variant: "bronze" as const },
  { title: "Team Player", icon: Award, variant: "locked" as const },
];

export default function EmployeeDashboard() {
  const [projects, setProjects] = useState(mockProjects);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: newStatus as any } : p
      )
    );
    toast.success("Project status updated!");
  };

  const handleRequestCredit = (id: string) => {
    toast.success("Credit request submitted for approval!");
  };

  const progressPercentage = (mockStats.monthlyCredits / mockStats.monthlyTarget) * 100;

  return (
    <DashboardLayout role="employee">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your performance and earn credits</p>
        </div>

        {/* Top section: Profile + Progress + Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <ProfileCard
            name={mockUser.name}
            role={mockUser.role}
            rank={mockUser.rank}
            previousRank={mockUser.previousRank}
          />

          {/* Monthly Progress */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-lg animate-scale-in">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Progress</h3>
            <ProgressRing progress={progressPercentage} size={140} strokeWidth={10} />
            <p className="text-sm text-muted-foreground mt-4">
              <span className="font-bold text-foreground">{mockStats.monthlyCredits}</span> / {mockStats.monthlyTarget} credits
            </p>
          </div>

          {/* Credit Wallet */}
          <div className="space-y-4">
            <StatCard
              title="This Month"
              value={mockStats.monthlyCredits}
              subtitle="credits earned"
              icon={Coins}
              variant="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Lifetime"
              value={mockStats.lifetimeCredits.toLocaleString()}
              subtitle="total credits"
              icon={Trophy}
              variant="accent"
            />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Completed Projects"
            value={mockStats.completedProjects}
            icon={Target}
          />
          <StatCard
            title="Pending Credits"
            value={mockStats.pendingCredits}
            icon={Coins}
            subtitle="awaiting approval"
          />
          <StatCard
            title="Current Rank"
            value={`#${mockUser.rank}`}
            icon={Trophy}
          />
          <StatCard
            title="Days Active"
            value="23"
            icon={Calendar}
            subtitle="this month"
          />
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-xl font-bold font-display text-foreground mb-6">Achievements</h2>
          <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
            {mockAchievements.map((achievement, index) => (
              <BadgeAchievement
                key={index}
                title={achievement.title}
                icon={achievement.icon}
                variant={achievement.variant}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* My Missions / Allocated Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display text-foreground">My Missions</h2>
            <span className="text-sm text-muted-foreground">
              {projects.filter(p => p.status !== "completed").length} active
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <MissionCard
                key={project.id}
                {...project}
                onUpdateStatus={handleUpdateStatus}
                onRequestCredit={handleRequestCredit}
                className={`animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
