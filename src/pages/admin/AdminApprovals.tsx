import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, Loader2, Coins } from "lucide-react";

interface CreditRequest {
  id: string;
  credits_requested: number;
  status: string;
  notes: string | null;
  created_at: string;
  employee_id: string;
  assignment_id: string;
}

interface EnrichedRequest extends CreditRequest {
  employee_name: string;
  project_name: string;
}

export default function AdminApprovals() {
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    // Fetch credit requests
    const { data: requestsData, error: requestsError } = await supabase
      .from("credit_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
      setLoading(false);
      return;
    }

    // Enrich with employee and project names
    const enrichedRequests: EnrichedRequest[] = [];

    for (const request of requestsData || []) {
      // Get employee name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", request.employee_id)
        .single();

      // Get project name via assignment
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

      enrichedRequests.push({
        ...request,
        employee_name: profileData?.full_name || "Unknown",
        project_name: projectName,
      });
    }

    setRequests(enrichedRequests);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string, approved: boolean) => {
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
    } else {
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Credit request has been ${approved ? "approved" : "rejected"}`,
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

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

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
          <>
            {/* Pending Requests */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-foreground">Pending Requests</h2>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {pendingRequests.length}
                </Badge>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
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
                            onClick={() => handleApproval(request.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApproval(request.id, true)}
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

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold font-display text-foreground">History</h2>
                <div className="grid gap-4">
                  {processedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border bg-card p-4 shadow-sm opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-foreground">{request.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{request.project_name}</p>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
