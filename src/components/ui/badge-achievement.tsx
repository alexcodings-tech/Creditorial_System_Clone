import { cn } from "@/lib/utils";
import { Trophy, Star, Zap, Target, Award, Crown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BadgeAchievementProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: "gold" | "silver" | "bronze" | "locked";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BadgeAchievement({
  title,
  description,
  icon: Icon = Trophy,
  variant = "gold",
  size = "md",
  className,
}: BadgeAchievementProps) {
  const variants = {
    gold: "gradient-gold text-white shadow-lg",
    silver: "gradient-silver text-white shadow-md",
    bronze: "gradient-bronze text-white shadow-md",
    locked: "bg-muted text-muted-foreground",
  };

  const sizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-transform hover:scale-110",
          variants[variant],
          sizes[size],
          variant !== "locked" && "animate-float"
        )}
      >
        <Icon className={cn(iconSizes[size], variant === "locked" && "opacity-50")} />
        {variant === "gold" && (
          <div className="absolute -top-1 -right-1">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={cn(
          "font-semibold text-sm",
          variant === "locked" ? "text-muted-foreground" : "text-foreground"
        )}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export const achievementIcons = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  crown: Crown,
};
