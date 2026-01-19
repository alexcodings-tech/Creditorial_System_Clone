import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle, Play, Coins } from "lucide-react";

interface MissionCardProps {
  id: string;
  projectName: string;
  clientName: string;
  projectType: string;
  status: "not_started" | "in_progress" | "ready_for_review" | "completed";
  expectedCredits: number;
  dueDate: string;
  progress?: number;
  onUpdateStatus?: (id: string, status: string) => void;
  style?: React.CSSProperties;
  onRequestCredit?: (id: string) => void;
  className?: string;
}

const statusConfig = {
  not_started: {
    label: "Not Started",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-primary/10 text-primary",
    icon: Play,
  },
  ready_for_review: {
    label: "Ready for Review",
    color: "bg-warning/10 text-warning",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
};

const projectTypeColors: Record<string, string> = {
  "Meta Ads": "bg-blue-100 text-blue-700",
  "SEO": "bg-green-100 text-green-700",
  "Web": "bg-purple-100 text-purple-700",
  "Design": "bg-pink-100 text-pink-700",
  "Content": "bg-orange-100 text-orange-700",
};

export function MissionCard({
  id,
  projectName,
  clientName,
  projectType,
  status,
  expectedCredits,
  dueDate,
  progress = 0,
  onUpdateStatus,
  onRequestCredit,
  className,
  style,
}: MissionCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const getDaysRemaining = () => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up",
        className
      )}
      style={style}
    >
      {/* Project type badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <Badge className={cn("font-medium", projectTypeColors[projectType] || "bg-muted")}>
            {projectType}
          </Badge>
          <h3 className="text-lg font-semibold font-display text-foreground mt-2">
            {projectName}
          </h3>
          <p className="text-sm text-muted-foreground">{clientName}</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full gradient-accent text-white text-sm font-medium">
          <Coins className="h-4 w-4" />
          <span>{expectedCredits}</span>
        </div>
      </div>

      {/* Progress */}
      {status === "in_progress" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Status and deadline */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className={cn("gap-1", config.color)}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
        <span
          className={cn(
            "text-sm font-medium",
            daysRemaining < 0
              ? "text-destructive"
              : daysRemaining <= 3
              ? "text-warning"
              : "text-muted-foreground"
          )}
        >
          {daysRemaining < 0
            ? `${Math.abs(daysRemaining)}d overdue`
            : `${daysRemaining}d remaining`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {status !== "completed" && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              const nextStatus = {
                not_started: "in_progress",
                in_progress: "ready_for_review",
                ready_for_review: "completed",
              }[status];
              onUpdateStatus?.(id, nextStatus || status);
            }}
          >
            Update Status
          </Button>
        )}
        {status === "completed" && (
          <Button
            size="sm"
            className="flex-1 gradient-primary text-primary-foreground shadow-glow"
            onClick={() => onRequestCredit?.(id)}
          >
            <Coins className="h-4 w-4 mr-2" />
            Request Credit
          </Button>
        )}
      </div>
    </div>
  );
}
