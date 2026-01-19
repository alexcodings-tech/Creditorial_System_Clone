import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { RankBadge } from "@/components/ui/rank-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react";

// Mock data
const mockLeaderboardData = [
  { id: "1", rank: 1, previousRank: 1, name: "Priya Kumar", role: "Senior Digital Marketing", credits: 94, avatar: "" },
  { id: "2", rank: 2, previousRank: 4, name: "Rahul Sharma", role: "Graphics Designer", credits: 88, avatar: "" },
  { id: "3", rank: 3, previousRank: 2, name: "Anita Singh", role: "Content Writer", credits: 82, avatar: "" },
  { id: "4", rank: 4, previousRank: 6, name: "Vignesh S", role: "Digital Marketing Executive", credits: 78, avatar: "" },
  { id: "5", rank: 5, previousRank: 3, name: "Bharath J", role: "Digital Marketing Executive", credits: 75, avatar: "" },
  { id: "6", rank: 6, previousRank: 5, name: "Meera Reddy", role: "Digital Marketing / Coordination", credits: 71, avatar: "" },
  { id: "7", rank: 7, previousRank: 8, name: "Arjun Nair", role: "Graphics Designer", credits: 65, avatar: "" },
  { id: "8", rank: 8, previousRank: 7, name: "Deepa Iyer", role: "Content Writer", credits: 62, avatar: "" },
];

const roleCategories = [
  { value: "all", label: "All Roles" },
  { value: "senior-dm", label: "Senior Digital Marketing" },
  { value: "dm-executive", label: "DM Executive" },
  { value: "designer", label: "Graphics Designer" },
  { value: "content", label: "Content Writer" },
  { value: "coordination", label: "Coordination" },
];

const currentUserId = "4"; // Vignesh S

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [roleFilter, setRoleFilter] = useState("all");

  const topThree = mockLeaderboardData.slice(0, 3);
  const restOfLeaderboard = mockLeaderboardData.slice(3);

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
            {/* Top 3 Podium */}
            <div className="mb-12">
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
                  <div className="relative mb-4">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full p-1 gradient-silver shadow-lg">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xl sm:text-2xl font-bold font-display">
                        {topThree[1]?.name.split(" ").map(n => n[0]).join("")}
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
                        {topThree[0]?.name.split(" ").map(n => n[0]).join("")}
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
                        {topThree[2]?.name.split(" ").map(n => n[0]).join("")}
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

            {/* Rest of leaderboard */}
            <div className="space-y-3">
              {restOfLeaderboard.map((user, index) => (
                <LeaderboardRow
                  key={user.id}
                  rank={user.rank}
                  previousRank={user.previousRank}
                  name={user.name}
                  role={user.role}
                  credits={user.credits}
                  isCurrentUser={user.id === currentUserId}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Current user's position highlight if not in visible list */}
            <div className="mt-8 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Your Current Position</p>
                  <p className="text-sm text-muted-foreground">
                    You're at <span className="font-bold text-primary">rank #4</span> with{" "}
                    <span className="font-bold">78 credits</span>. Keep going!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
