import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Shield, Loader2 } from "lucide-react";

export default function EmployeeProfile() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
    setIsSaving(false);
  };

  return (
    <DashboardLayout role="employee">
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-2xl">
              {profile?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile?.full_name}</h2>
              <p className="text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input value={profile?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <Input value={profile?.role || ""} disabled className="capitalize" />
              <p className="text-xs text-muted-foreground">Contact admin to change role</p>
            </div>

            <Button
              onClick={handleSave}
              className="gradient-primary text-primary-foreground shadow-glow"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
