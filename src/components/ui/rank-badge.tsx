import { cn } from "@/lib/utils";
import { Crown, Medal, Award } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const getRankStyle = () => {
    if (rank === 1) return { gradient: "gradient-gold", icon: Crown, glow: "shadow-[0_0_20px_hsl(45,93%,47%,0.5)]" };
    if (rank === 2) return { gradient: "gradient-silver", icon: Medal, glow: "shadow-[0_0_15px_hsl(210,14%,66%,0.4)]" };
    if (rank === 3) return { gradient: "gradient-bronze", icon: Award, glow: "shadow-[0_0_15px_hsl(30,59%,53%,0.4)]" };
    return { gradient: "bg-muted", icon: null, glow: "" };
  };

  const sizes = {
    sm: { container: "h-8 w-8", icon: "h-4 w-4", text: "text-sm" },
    md: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-base" },
    lg: { container: "h-14 w-14", icon: "h-7 w-7", text: "text-xl" },
  };

  const { gradient, icon: Icon, glow } = getRankStyle();
  const sizeStyles = sizes[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold font-display",
        gradient,
        glow,
        sizeStyles.container,
        rank <= 3 ? "text-white" : "text-muted-foreground",
        className
      )}
    >
      {Icon ? (
        <Icon className={sizeStyles.icon} />
      ) : (
        <span className={sizeStyles.text}>#{rank}</span>
      )}
    </div>
  );
}
