import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "admin" | "lead" | "employee";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number;
  name: string;
  role: string;
  credits: number;
  avatar: string;
}

const roleCategories = [
  { value: "all", label: "All Roles" },
  { value: "lead", label: "Lead" },
  { value: "employee", label: "Employee" },
];

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [roleFilter, setRoleFilter] = useState("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  
  // Determine the user's role for proper sidebar display
  const userRole: AppRole = (profile?.role as AppRole) || "employee";

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe, roleFilter]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch all profiles (employees and leads only)
    let profilesQuery = supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .in("role", ["employee", "lead"] as const);

    if (roleFilter !== "all") {
      profilesQuery = profilesQuery.eq("role", roleFilter as "employee" | "lead");
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      setLoading(false);
      return;
    }

    // Fetch approved credit requests for each profile
    const leaderboardEntries: LeaderboardEntry[] = [];

    for (const profile of profiles || []) {
      // Get approved credit_requests
      const { data: creditRequests } = await supabase
        .from("credit_requests")
        .select("credits_requested, created_at")
        .eq("employee_id", profile.id)
        .eq("status", "approved")
        .gte("created_at", startDate.toISOString());

      // Get approved mission_requests (cast to any for new table)
      const { data: missionRequests } = await (supabase as any)
        .from("mission_requests")
        .select("credits_requested, created_at")
        .eq("employee_id", profile.id)
        .eq("status", "approved")
        .gte("created_at", startDate.toISOString());

      const totalCredits = 
        (creditRequests || []).reduce((sum: number, r: any) => sum + r.credits_requested, 0) +
        ((missionRequests as any[]) || []).reduce((sum: number, r: any) => sum + r.credits_requested, 0);

      leaderboardEntries.push({
        id: profile.id,
        rank: 0,
        previousRank: 0,
        name: profile.full_name,
        role: profile.role === "lead" ? "Team Lead" : "Employee",
        credits: totalCredits,
        avatar: profile.avatar_url || "",
      });
    }

    // Sort by credits and assign ranks
    leaderboardEntries.sort((a, b) => b.credits - a.credits);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.previousRank = index + 1; // For now, same as current rank
    });

    setLeaderboardData(leaderboardEntries);
    setLoading(false);
  };

  // Get only the current user's entry (privacy: users only see their own ranking)
  const currentUserEntry = leaderboardData.find(entry => entry.id === user?.id);
  const totalParticipants = leaderboardData.length;

  if (loading) {
    return (
      <DashboardLayout role={userRole}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">See how you rank against your team</p>
          </div>
          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roleCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="yearly">This Year</TabsTrigger>
          </TabsList>

          <TabsContent value={timeframe} className="mt-8">
            {!currentUserEntry ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No approved credits found for this period. Complete missions and get approvals to appear on the leaderboard!
              </div>
            ) : (
              <div className="space-y-6">
                {/* Your Ranking Card */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">Your Ranking</h2>
                  <LeaderboardRow
                    rank={currentUserEntry.rank}
                    previousRank={currentUserEntry.previousRank}
                    name={currentUserEntry.name}
                    role={currentUserEntry.role}
                    credits={currentUserEntry.credits}
                    avatar={currentUserEntry.avatar}
                    isCurrentUser={true}
                    className="animate-slide-up"
                  />
                </div>

                {/* Position Summary */}
                <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Your Current Position</p>
                      <p className="text-sm text-muted-foreground">
                        You're at <span className="font-bold text-primary">rank #{currentUserEntry.rank}</span> out of{" "}
                        <span className="font-bold">{totalParticipants} participants</span> with{" "}
                        <span className="font-bold">{currentUserEntry.credits} credits</span>. Keep going!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}