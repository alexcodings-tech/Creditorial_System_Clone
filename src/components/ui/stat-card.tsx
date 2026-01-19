import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent" | "success";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variants = {
    default: "bg-card border-border",
    primary: "gradient-primary text-primary-foreground border-transparent",
    accent: "gradient-accent text-accent-foreground border-transparent",
    success: "gradient-success text-success-foreground border-transparent",
  };

  const iconBgVariants = {
    default: "bg-primary/10 text-primary",
    primary: "bg-white/20 text-white",
    accent: "bg-white/20 text-white",
    success: "bg-white/20 text-white",
  };

  const subtitleVariants = {
    default: "text-muted-foreground",
    primary: "text-white/70",
    accent: "text-white/70",
    success: "text-white/70",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-scale-in",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium", subtitleVariants[variant])}>
            {title}
          </p>
          <p className="text-3xl font-bold font-display">{value}</p>
          {subtitle && (
            <p className={cn("text-sm", subtitleVariants[variant])}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className={cn("text-xs", subtitleVariants[variant])}>
                vs last month
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-3", iconBgVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      {variant !== "default" && (
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      )}
    </div>
  );
}
