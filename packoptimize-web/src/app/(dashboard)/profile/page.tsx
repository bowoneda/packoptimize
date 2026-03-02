"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  EnvelopeSimple,
  Lock,
  Bell,
  ShieldCheck,
  SignOut,
  Eye,
  EyeSlash,
  Buildings,
  DeviceMobile,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Notification preferences (local state — wire to API when backend supports it)
  const [emailOptimizations, setEmailOptimizations] = useState(true);
  const [emailBilling, setEmailBilling] = useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);

  const changePassword = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.put("/auth/password", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => {
      toast.error("Failed to update password. Check your current password.");
    },
  });

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const roleBadgeColor =
    user?.role === "OWNER"
      ? "bg-[#91E440] text-[#0B4228]"
      : user?.role === "ADMIN"
      ? "bg-[#0B4228] text-white"
      : "bg-[#E8EAED] text-[#8B95A5]";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0B4228]">Profile</h2>
        <p className="text-sm text-[#8B95A5]">
          Manage your personal account settings
        </p>
      </div>

      {/* ===== USER INFO ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <User size={18} /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar + name area */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B4228] text-xl font-bold text-[#91E440] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#0B4228] truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={`rounded-full text-[10px] font-bold px-2.5 py-0.5 ${roleBadgeColor}`}>
                  {user?.role}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-[#8B95A5]">
                  <Buildings size={12} />
                  {user?.tenantName}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info rows */}
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">Email</Label>
              <div className="flex items-center gap-2 text-sm text-[#111827]">
                <EnvelopeSimple size={14} className="text-[#8B95A5]" />
                {user?.email}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">User ID</Label>
              <code className="text-xs font-mono text-[#8B95A5] bg-[#F5F6F8] px-2 py-1 rounded-lg break-all">
                {user?.id}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-[#8B95A5] w-32 shrink-0 text-sm">Tenant ID</Label>
              <code className="text-xs font-mono text-[#8B95A5] bg-[#F5F6F8] px-2 py-1 rounded-lg break-all">
                {user?.tenantId}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== CHANGE PASSWORD ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Lock size={18} /> Change Password
          </CardTitle>
          <CardDescription className="text-[#8B95A5]">
            Update your password. You&apos;ll need your current password to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-[#8B95A5]">Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 pr-10 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B95A5] hover:text-[#0B4228] transition-colors"
              >
                {showPasswords ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#8B95A5]">New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Min 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[#8B95A5]">Confirm New Password</Label>
              <Input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords don&apos;t match</p>
          )}

          <Button
            onClick={handlePasswordSubmit}
            disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
            className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full text-sm font-semibold px-6"
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* ===== NOTIFICATION PREFERENCES ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Bell size={18} /> Notifications
          </CardTitle>
          <CardDescription className="text-[#8B95A5]">
            Choose which email notifications you receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Optimization alerts</p>
              <p className="text-xs text-[#8B95A5]">Get notified when an optimization run completes</p>
            </div>
            <Switch
              checked={emailOptimizations}
              onCheckedChange={setEmailOptimizations}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Billing updates</p>
              <p className="text-xs text-[#8B95A5]">Invoices, payment confirmations, and usage warnings</p>
            </div>
            <Switch
              checked={emailBilling}
              onCheckedChange={setEmailBilling}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Weekly savings report</p>
              <p className="text-xs text-[#8B95A5]">Summary of your weekly shipping savings</p>
            </div>
            <Switch
              checked={emailWeeklyReport}
              onCheckedChange={setEmailWeeklyReport}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== SECURITY ===== */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <ShieldCheck size={18} /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">Active session</p>
              <p className="text-xs text-[#8B95A5] flex items-center gap-1 mt-0.5">
                <DeviceMobile size={12} /> Current browser · Signed in now
              </p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-full text-sm font-semibold w-full sm:w-auto"
            >
              <SignOut size={14} className="mr-1.5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
