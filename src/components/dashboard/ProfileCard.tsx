import { RankBadge } from "@/components/ui/rank-badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  className?: string;
}

export function ProfileCard({
  name,
  role,
  avatar,
  rank,
  previousRank,
  className,
}: ProfileCardProps) {
  const rankChange = previousRank - rank;
  const isImproved = rankChange > 0;
  const isDeclined = rankChange < 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-lg animate-scale-in",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5" />
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-accent/10" />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-2xl font-bold font-display text-foreground">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
              ) : (
                name.split(" ").map(n => n[0]).join("")
              )}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1">
            <RankBadge rank={rank} size="sm" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold font-display text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{role}</p>
          
          {/* Rank movement */}
          <div className="mt-2 flex items-center gap-2">
            {isImproved && (
              <div className="flex items-center gap-1 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{rankChange} positions</span>
              </div>
            )}
            {isDeclined && (
              <div className="flex items-center gap-1 text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">{rankChange} positions</span>
              </div>
            )}
            {rankChange === 0 && (
              <span className="text-sm text-muted-foreground">Rank unchanged</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
