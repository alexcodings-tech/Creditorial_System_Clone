import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Database } from "lucide-react";

export default function AdminSettings() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system settings</p>
        </div>

        {/* General Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-display text-foreground">General</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Monthly Credit Cap</Label>
                <p className="text-sm text-muted-foreground">Maximum credits per employee per month</p>
              </div>
              <Input type="number" className="w-24" defaultValue={100} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Credit Request Approval Required</Label>
                <p className="text-sm text-muted-foreground">Require admin approval for credit requests</p>
              </div>
              <Switch defaultChecked />
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
                <p className="text-sm text-muted-foreground">Send email alerts for pending approvals</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">Send daily summary of activities</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-display text-foreground">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity (minutes)</p>
              </div>
              <Input type="number" className="w-24" defaultValue={30} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button className="gradient-primary text-primary-foreground shadow-glow">
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
