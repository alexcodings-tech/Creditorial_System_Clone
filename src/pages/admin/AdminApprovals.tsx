import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, Loader2, Coins, Target, Briefcase } from "lucide-react";

interface CreditRequest {
  id: string;
  credits_requested: number;
  status: string;
  notes: string | null;
  created_at: string;
  employee_id: string;
  assignment_id: string;
  source_type?: string;
}

interface MissionRequest {
  id: string;
  credits_requested: number;
  status: string;
  description: string | null;
  created_at: string;
  employee_id: string;
  mission_id: string;
}

interface EnrichedCreditRequest extends CreditRequest {
  employee_name: string;
  project_name: string;
}

interface EnrichedMissionRequest extends MissionRequest {
  employee_name: string;
  mission_name: string;
}

export default function AdminApprovals() {
  const [creditRequests, setCreditRequests] = useState<EnrichedCreditRequest[]>([]);
  const [missionRequests, setMissionRequests] = useState<EnrichedMissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    
    // Fetch credit requests
    const { data: creditsData, error: creditsError } = await supabase
      .from("credit_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (creditsError) {
      console.error("Error fetching credit requests:", creditsError);
    }

    // Enrich credit requests with employee and project names
    const enrichedCredits: EnrichedCreditRequest[] = [];
    for (const request of creditsData || []) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", request.employee_id)
        .single();

      const { data: assignmentData } = await supabase
        .from("project_assignments")
        .select("project_id")
        .eq("id", request.assignment_id)
        .single();

      let projectName = "Unknown Project";
      if (assignmentData) {
        const { data: projectData } = await supabase
          .from("projects")
          .select("name")
          .eq("id", assignmentData.project_id)
          .single();
        projectName = projectData?.name || "Unknown Project";
      }

      enrichedCredits.push({
        ...request,
        employee_name: profileData?.full_name || "Unknown",
        project_name: projectName,
      });
    }
    setCreditRequests(enrichedCredits);

    // Fetch mission requests (cast to any for new table)
    const { data: missionsData, error: missionsError } = await (supabase as any)
      .from("mission_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (missionsError) {
      console.error("Error fetching mission requests:", missionsError);
    }

    // Enrich mission requests
    const enrichedMissions: EnrichedMissionRequest[] = [];
    for (const request of (missionsData as any[]) || []) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", request.employee_id)
        .single();

      const { data: missionData } = await (supabase as any)
        .from("common_missions")
        .select("mission_name")
        .eq("id", request.mission_id)
        .single();

      enrichedMissions.push({
        ...request,
        employee_name: profileData?.full_name || "Unknown",
        mission_name: missionData?.mission_name || "Unknown Mission",
      });
    }
    setMissionRequests(enrichedMissions);

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreditApproval = async (requestId: string, approved: boolean) => {
    // Find the request to get the assignment_id
    const request = creditRequests.find((r) => r.id === requestId);
    
    const { error } = await supabase
      .from("credit_requests")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${approved ? "approve" : "reject"} request`,
        variant: "destructive",
      });
      return;
    }

    // If approved, automatically mark the project assignment as completed
    // This only applies to Projects, not Common Missions
    if (approved && request?.assignment_id) {
      const { error: assignmentError } = await supabase
        .from("project_assignments")
        .update({
          status: "completed",
        })
        .eq("id", request.assignment_id);

      if (assignmentError) {
        console.error("Error updating project assignment status:", assignmentError);
        // Don't show error toast - the credit approval was successful
      }
    }

    toast({
      title: approved ? "Approved" : "Rejected",
      description: `Credit request has been ${approved ? "approved" : "rejected"}${approved ? " and project marked as completed" : ""}`,
    });
    fetchRequests();
  };

  const handleMissionApproval = async (requestId: string, approved: boolean) => {
    const { error } = await (supabase as any)
      .from("mission_requests")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${approved ? "approve" : "reject"} mission request`,
        variant: "destructive",
      });
    } else {
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Mission credit request has been ${approved ? "approved" : "rejected"}`,
      });
      fetchRequests();
    }
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

  const pendingCredits = creditRequests.filter((r) => r.status === "pending");
  const processedCredits = creditRequests.filter((r) => r.status !== "pending");
  const pendingMissions = missionRequests.filter((r) => r.status === "pending");
  const processedMissions = missionRequests.filter((r) => r.status !== "pending");

  const totalPending = pendingCredits.length + pendingMissions.length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve credit requests</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Project Credits
                {pendingCredits.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingCredits.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="missions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Mission Credits
                {pendingMissions.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {pendingMissions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Project Credit Requests */}
            <TabsContent value="projects" className="mt-6 space-y-6">
              {/* Pending */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display text-foreground">Pending Requests</h2>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    {pendingCredits.length}
                  </Badge>
                </div>

                {pendingCredits.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                    No pending project credit requests
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingCredits.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-xl border border-border bg-card p-6 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground text-lg">
                                {request.employee_name}
                              </h3>
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <Coins className="h-4 w-4" />
                                {request.credits_requested} credits
                              </div>
                            </div>
                            <p className="text-muted-foreground">{request.project_name}</p>
                            {request.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                "{request.notes}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleCreditApproval(request.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleCreditApproval(request.id, true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              {processedCredits.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold font-display text-foreground">History</h2>
                  <div className="grid gap-4">
                    {processedCredits.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-xl border border-border bg-card p-4 shadow-sm opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium text-foreground">{request.employee_name}</p>
                              {/* <p className="text-sm text-muted-foreground">{request.project_name}</p> */}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold">
                              {request.credits_requested} credits
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Mission Credit Requests */}
            <TabsContent value="missions" className="mt-6 space-y-6">
              {/* Pending */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display text-foreground">Pending Mission Requests</h2>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    {pendingMissions.length}
                  </Badge>
                </div>

                {pendingMissions.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                    No pending mission credit requests
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingMissions.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-xl border border-border bg-card p-6 shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground text-lg">
                                {request.employee_name}
                              </h3>
                              <div className="flex items-center gap-1 text-primary font-bold">
                                <Coins className="h-4 w-4" />
                                {request.credits_requested} credits
                              </div>
                              <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/30">
                                <Target className="h-3 w-3 mr-1" />
                                Mission
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{request.mission_name}</p>
                            {request.description && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                "{request.description}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted: {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleMissionApproval(request.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleMissionApproval(request.id, true)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              {processedMissions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold font-display text-foreground">History</h2>
                  <div className="grid gap-4">
                    {processedMissions.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-xl border border-border bg-card p-4 shadow-sm opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium text-foreground">{request.employee_name}</p>
                              <p className="text-sm text-muted-foreground">{request.mission_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold">
                              {request.credits_requested} credits
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
