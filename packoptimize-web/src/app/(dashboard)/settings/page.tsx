"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Tenant, BillingUsage } from "@/types/api";
import { Trash, CreditCard, ArrowSquareOut, ShoppingCart, Copy, Check } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [defaultCarrier, setDefaultCarrier] = useState("FEDEX");
  const [defaultFillMaterial, setDefaultFillMaterial] = useState("AIR_PILLOWS");
  const [copied, setCopied] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: async () => {
      const res = await api.get<Tenant>("/tenants/current");
      return res.data;
    },
  });

  const { data: billingUsage, isLoading: isLoadingBilling } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: async () => {
      const res = await api.get<BillingUsage>("/v1/billing/usage");
      return res.data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (data: { defaultCarrier: string; defaultFillMaterial: string }) => {
      const res = await api.put("/tenants/settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const deleteTenant = useMutation({
    mutationFn: async () => {
      await api.delete("/tenants/current");
    },
    onSuccess: () => {
      toast.success("Tenant deleted");
      logout();
    },
    onError: () => {
      toast.error("Failed to delete tenant");
    },
  });

  const upgradeCheckout = useMutation({
    mutationFn: async (plan: string) => {
      const res = await api.post<{ checkoutUrl: string }>("/v1/billing/checkout", { plan });
      return res.data;
    },
    onSuccess: (data) => {
      window.open(data.checkoutUrl, "_blank");
    },
    onError: () => {
      toast.error("Failed to create checkout session");
    },
  });

  const manageSubscription = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ portalUrl: string }>("/v1/billing/portal");
      return res.data;
    },
    onSuccess: (data) => {
      window.open(data.portalUrl, "_blank");
    },
    onError: () => {
      toast.error("Failed to open billing portal");
    },
  });

  // Usage progress bar helpers
  const usagePercent = billingUsage
    ? billingUsage.includedOptimizations > 0
      ? Math.min(100, (billingUsage.usedOptimizations / billingUsage.includedOptimizations) * 100)
      : 0
    : 0;

  const usageColor =
    usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-green-500";

  const isPaidPlan = billingUsage && billingUsage.plan !== "FREE";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and preferences
        </p>
      </div>

      {/* Tenant Info */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Organization Name</Label>
                  <p className="text-sm font-medium">{tenant?.name ?? user?.tenantName ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <p className="text-sm font-mono">{tenant?.slug ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Plan</Label>
                <Badge variant="secondary" className="rounded-full">{tenant?.plan ?? "Free"}</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing & Usage */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard size={16} />
            <CardTitle className="text-base">Billing & Usage</CardTitle>
          </div>
          <CardDescription>
            Monitor your optimization usage and manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoadingBilling ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : billingUsage ? (
            <>
              {/* Current Plan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Plan:</span>
                  <Badge
                    variant={isPaidPlan ? "default" : "secondary"}
                    className={isPaidPlan ? "bg-[#0B4228] rounded-full" : "rounded-full"}
                  >
                    {billingUsage.plan}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Period: {billingUsage.billingPeriod}
                </span>
              </div>

              {/* Usage Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Optimizations this month</span>
                  <span className="font-medium">
                    {billingUsage.usedOptimizations}
                    {billingUsage.includedOptimizations > 0 &&
                      ` / ${billingUsage.includedOptimizations}`}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${usageColor}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {usagePercent >= 90 && !isPaidPlan && (
                  <p className="text-xs text-red-600">
                    You&apos;re approaching your free plan limit. Upgrade to continue optimizing.
                  </p>
                )}
              </div>

              {/* Overage Info */}
              {isPaidPlan && billingUsage.overageCount > 0 && (
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {billingUsage.overageCount} overage optimization
                  {billingUsage.overageCount !== 1 ? "s" : ""} at $
                  {billingUsage.plan === "STARTER" ? "0.04" : "0.03"}/each = $
                  {billingUsage.overageCost.toFixed(2)}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isPaidPlan ? (
                  <>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300"
                      onClick={() => upgradeCheckout.mutate("STARTER")}
                      disabled={upgradeCheckout.isPending}
                    >
                      {upgradeCheckout.isPending ? "Loading..." : "Upgrade to Starter — $99/mo"}
                      {!upgradeCheckout.isPending && <ArrowSquareOut size={12} className="ml-1" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                      onClick={() => upgradeCheckout.mutate("GROWTH")}
                      disabled={upgradeCheckout.isPending}
                    >
                      Growth — $249/mo
                      <ArrowSquareOut size={12} className="ml-1" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manageSubscription.mutate()}
                    disabled={manageSubscription.isPending}
                  >
                    {manageSubscription.isPending ? "Loading..." : "Manage Subscription"}
                    {!manageSubscription.isPending && <ArrowSquareOut size={12} className="ml-1" />}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to load billing information. Please try again later.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shopify Integration */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} />
            <CardTitle className="text-base">Shopify Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your Shopify store to get optimized shipping rates at checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="secondary">Not Connected</Badge>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Webhook URL</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#F5F6F8] rounded-xl px-3 py-2 text-[10px] sm:text-xs font-mono break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}/api/proxy/v1/integrations/shopify/rates
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/api/proxy/v1/integrations/shopify/rates`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Instructions</Label>
            <p className="text-xs text-muted-foreground">
              1. In your Shopify admin, go to Settings &rarr; Shipping &rarr; Carrier accounts{" "}
              <br />
              2. Add a custom carrier service with the webhook URL above
              <br />
              3. Set the X-API-Key header to your PackOptimize API key
              <br />
              4. Shopify will send cart data and receive optimized shipping rates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Preferences */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardHeader>
          <CardTitle className="text-base">Default Preferences</CardTitle>
          <CardDescription>These defaults are pre-selected when running optimizations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Default Carrier</Label>
              <Select value={defaultCarrier} onValueChange={setDefaultCarrier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEDEX">FedEx</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="USPS">USPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Fill Material</Label>
              <Select value={defaultFillMaterial} onValueChange={setDefaultFillMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIR_PILLOWS">Air Pillows</SelectItem>
                  <SelectItem value="KRAFT_PAPER">Kraft Paper</SelectItem>
                  <SelectItem value="BUBBLE_WRAP">Bubble Wrap</SelectItem>
                  <SelectItem value="PACKING_PEANUTS">Packing Peanuts</SelectItem>
                  <SelectItem value="FOAM_IN_PLACE">Foam-in-Place</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 min-h-[44px] px-5 sm:px-6"
            onClick={() =>
              updateSettings.mutate({ defaultCarrier, defaultFillMaterial })
            }
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all its data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash size={16} className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your organization, all items, box types,
                    optimization history, and API keys. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteTenant.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
