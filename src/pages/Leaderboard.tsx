import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { RankBadge } from "@/components/ui/rank-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Crown, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

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

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);
  
  const currentUserEntry = leaderboardData.find(entry => entry.id === user?.id);

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
            {leaderboardData.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No approved credits found for this period. Complete missions and get approvals to appear on the leaderboard!
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {topThree.length >= 3 && (
                  <div className="mb-12">
                    <div className="flex items-end justify-center gap-4 sm:gap-8">
                      {/* 2nd Place */}
                      <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
                        <div className="relative mb-4">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full p-1 gradient-silver shadow-lg">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xl sm:text-2xl font-bold font-display">
                              {topThree[1]?.avatar ? (
                                <img src={topThree[1].avatar} alt={topThree[1].name} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topThree[1]?.name.split(" ").map(n => n[0]).join("")
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <RankBadge rank={2} size="sm" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground text-sm sm:text-base">{topThree[1]?.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">{topThree[1]?.role}</p>
                          <p className="text-lg font-bold font-display text-silver mt-1">{topThree[1]?.credits} pts</p>
                        </div>
                        <div className="h-24 w-20 sm:w-28 gradient-silver rounded-t-lg mt-4 flex items-center justify-center">
                          <Medal className="h-8 w-8 text-white/80" />
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="flex flex-col items-center animate-slide-up">
                        <div className="relative mb-4">
                          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full p-1 gradient-gold shadow-[0_0_30px_hsl(45,93%,47%,0.5)] animate-pulse-slow">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-2xl sm:text-3xl font-bold font-display">
                              {topThree[0]?.avatar ? (
                                <img src={topThree[0].avatar} alt={topThree[0].name} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topThree[0]?.name.split(" ").map(n => n[0]).join("")
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <RankBadge rank={1} size="md" />
                          </div>
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Crown className="h-8 w-8 text-gold animate-bounce-subtle" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-foreground text-base sm:text-lg">{topThree[0]?.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{topThree[0]?.role}</p>
                          <p className="text-xl font-bold font-display text-gold mt-1">{topThree[0]?.credits} pts</p>
                        </div>
                        <div className="h-32 w-24 sm:w-32 gradient-gold rounded-t-lg mt-4 flex items-center justify-center">
                          <Trophy className="h-10 w-10 text-white/80" />
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "200ms" }}>
                        <div className="relative mb-4">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full p-1 gradient-bronze shadow-lg">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xl sm:text-2xl font-bold font-display">
                              {topThree[2]?.avatar ? (
                                <img src={topThree[2].avatar} alt={topThree[2].name} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                topThree[2]?.name.split(" ").map(n => n[0]).join("")
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <RankBadge rank={3} size="sm" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground text-sm sm:text-base">{topThree[2]?.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">{topThree[2]?.role}</p>
                          <p className="text-lg font-bold font-display text-bronze mt-1">{topThree[2]?.credits} pts</p>
                        </div>
                        <div className="h-20 w-20 sm:w-28 gradient-bronze rounded-t-lg mt-4 flex items-center justify-center">
                          <Award className="h-8 w-8 text-white/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rest of leaderboard */}
                <div className="space-y-3">
                  {restOfLeaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.id}
                      rank={entry.rank}
                      previousRank={entry.previousRank}
                      name={entry.name}
                      role={entry.role}
                      credits={entry.credits}
                      avatar={entry.avatar}
                      isCurrentUser={entry.id === user?.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${(index + 3) * 100}ms` } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* Current user's position highlight */}
                {currentUserEntry && (
                  <div className="mt-8 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Your Current Position</p>
                        <p className="text-sm text-muted-foreground">
                          You're at <span className="font-bold text-primary">rank #{currentUserEntry.rank}</span> with{" "}
                          <span className="font-bold">{currentUserEntry.credits} credits</span>. Keep going!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}