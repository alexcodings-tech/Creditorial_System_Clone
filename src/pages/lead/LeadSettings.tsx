import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Bell, User } from "lucide-react";

export default function LeadSettings() {
  const { profile } = useAuth();

  return (
    <DashboardLayout role="lead">
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences</p>
        </div>

        {/* Profile Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-display text-foreground">Profile</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={profile?.full_name || ""} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={profile?.email || ""} disabled />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-display text-foreground">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for team updates</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Project Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified when projects are updated</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="gradient-primary text-primary-foreground shadow-glow">
          Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
}
