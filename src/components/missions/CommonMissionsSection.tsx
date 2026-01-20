import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  Plane, 
  Users, 
  GraduationCap, 
  Presentation, 
  FileText, 
  Code, 
  Heart,
  Loader2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Coins
} from "lucide-react";

interface Mission {
  id: string;
  mission_name: string;
  mission_description: string | null;
  default_credit_value: number;
  is_active: boolean;
}

interface MissionRequest {
  id: string;
  mission_id: string;
  credits_requested: number;
  description: string | null;
  status: string;
  created_at: string;
  mission?: Mission;
}

const missionIcons: { [key: string]: any } = {
  "Zoom Meeting": Video,
  "Business Trip": Plane,
  "Team Assistance": Users,
  "Training Session": GraduationCap,
  "Client Presentation": Presentation,
  "Documentation": FileText,
  "Code Review": Code,
  "Mentoring": Heart,
};

export function CommonMissionsSection() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [myRequests, setMyRequests] = useState<MissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch active missions (cast to any for new table)
    const { data: missionsData } = await (supabase as any)
      .from("common_missions")
      .select("*")
      .eq("is_active", true);

    setMissions((missionsData as Mission[]) || []);

    // Fetch user's mission requests (cast to any for new table)
    const { data: requestsData } = await (supabase as any)
      .from("mission_requests")
      .select("*")
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false });

    setMyRequests((requestsData as MissionRequest[]) || []);
    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (!selectedMission || !user) return;

    setSubmitting(true);

    const { error } = await (supabase as any).from("mission_requests").insert({
      employee_id: user.id,
      mission_id: selectedMission.id,
      credits_requested: selectedMission.default_credit_value,
      description: description || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit mission request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Submitted",
        description: `Your ${selectedMission.mission_name} credit request has been submitted for approval`,
      });
      setDialogOpen(false);
      setDescription("");
      setSelectedMission(null);
      fetchData();
    }

    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMissionIcon = (missionName: string) => {
    const Icon = missionIcons[missionName] || FileText;
    return Icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Count completed missions (approved requests)
  const getMissionCompletionCount = (missionId: string) => {
    return myRequests.filter(r => r.mission_id === missionId && r.status === "approved").length;
  };

  return (
    <div className="space-y-6">
      {/* Available Missions */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display text-foreground">Common Missions</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Coins className="h-3 w-3 mr-1" />
            Earn bonus credits
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {missions.map((mission) => {
            const Icon = getMissionIcon(mission.mission_name);
            const completedCount = getMissionCompletionCount(mission.id);
            
            return (
              <Dialog key={mission.id} open={dialogOpen && selectedMission?.id === mission.id} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setSelectedMission(null);
                  setDescription("");
                }
              }}>
                <DialogTrigger asChild>
                  <div
                    className="relative rounded-xl border border-border bg-background p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md group"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate">{mission.mission_name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mission.mission_description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-primary">+{mission.default_credit_value} credits</span>
                      {completedCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Completed: {completedCount}x
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      Request {mission.mission_name} Credit
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">{mission.mission_description}</p>
                      <p className="text-lg font-bold text-primary mt-2">+{mission.default_credit_value} credits</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Description (optional)
                      </label>
                      <Textarea
                        placeholder="Provide details about the mission you completed..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitRequest} disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>

      {/* My Mission Requests */}
      {myRequests.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="text-xl font-bold font-display text-foreground mb-4">My Mission Requests</h2>
          <div className="space-y-3">
            {myRequests.slice(0, 5).map((request) => {
              const mission = missions.find(m => m.id === request.mission_id);
              const Icon = mission ? getMissionIcon(mission.mission_name) : FileText;
              
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{mission?.mission_name || "Unknown Mission"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{request.credits_requested} credits</span>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}