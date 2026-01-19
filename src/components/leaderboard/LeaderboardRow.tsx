import { cn } from "@/lib/utils";
import { RankBadge } from "@/components/ui/rank-badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardRowProps {
  rank: number;
  previousRank: number;
  name: string;
  role: string;
  avatar?: string;
  credits: number;
  maxCredits?: number;
  isCurrentUser?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function LeaderboardRow({
  rank,
  previousRank,
  name,
  role,
  avatar,
  credits,
  maxCredits = 100,
  isCurrentUser = false,
  className,
  style,
}: LeaderboardRowProps) {
  const rankChange = previousRank - rank;
  const progressPercentage = (credits / maxCredits) * 100;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-md",
        isCurrentUser && "border-primary/50 bg-primary/5 ring-2 ring-primary/20",
        rank <= 3 && "border-gold/30",
        className
      )}
      style={style}
    >
      {/* Rank */}
      <RankBadge rank={rank} size="md" />

      {/* Rank change indicator */}
      <div className="w-8 flex justify-center">
        {rankChange > 0 && (
          <div className="flex items-center text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">{rankChange}</span>
          </div>
        )}
        {rankChange < 0 && (
          <div className="flex items-center text-destructive">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">{Math.abs(rankChange)}</span>
          </div>
        )}
        {rankChange === 0 && (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        <div
          className={cn(
            "h-12 w-12 rounded-full p-0.5",
            rank === 1 && "bg-gradient-to-br from-gold to-yellow-500",
            rank === 2 && "bg-gradient-to-br from-silver to-gray-400",
            rank === 3 && "bg-gradient-to-br from-bronze to-orange-400",
            rank > 3 && "bg-gradient-to-br from-primary to-accent"
          )}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-sm font-bold font-display">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
              name.split(" ").map(n => n[0]).join("")
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          {isCurrentUser && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
              You
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{role}</p>
      </div>

      {/* Credits and progress */}
      <div className="flex items-center gap-4 min-w-[180px]">
        <div className="flex-1">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-display text-foreground">{credits}</span>
          <span className="text-sm text-muted-foreground">/{maxCredits}</span>
        </div>
      </div>
    </div>
  );
}
