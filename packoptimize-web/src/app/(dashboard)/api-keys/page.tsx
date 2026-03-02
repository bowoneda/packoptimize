"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import type { ApiKey, CreateApiKeyResponse } from "@/types/api";
import { Key, Plus, Copy, Trash, Warning } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

const PERMISSIONS = [
  { value: "optimize", label: "Optimize" },
  { value: "items:read", label: "Items: Read" },
  { value: "items:write", label: "Items: Write" },
  { value: "boxes:read", label: "Boxes: Read" },
  { value: "boxes:write", label: "Boxes: Write" },
];

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyResponse | null>(null);
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState("none");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["optimize"]);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await api.get<ApiKey[]>("/api-keys");
      return res.data;
    },
  });

  const createKey = useMutation({
    mutationFn: async () => {
      let expiresAt: string | undefined;
      if (expiration !== "none") {
        const days = parseInt(expiration);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }
      const res = await api.post<CreateApiKeyResponse>("/api-keys", {
        name: name || undefined,
        permissions: selectedPermissions,
        expiresAt,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNewKey(data);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    },
  });

  const handleCreate = () => {
    createKey.mutate();
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewKey(null);
      setName("");
      setExpiration("none");
      setSelectedPermissions(["optimize"]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 min-h-[44px] px-5 sm:px-6">
              <Plus size={16} className="mr-2" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <Alert className="border-amber-500 bg-amber-50">
                  <Warning size={16} />
                  <AlertDescription>
                    Save this key now — you will not be able to see it again.
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-2">
                  <Input value={newKey.key} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newKey.key)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleDialogClose(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Name (optional)</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My integration"
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-2">
                    {PERMISSIONS.map((perm) => (
                      <div key={perm.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPermissions.includes(perm.value)}
                          onCheckedChange={() => togglePermission(perm.value)}
                        />
                        <span className="text-sm">{perm.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Expiration</Label>
                  <Select value={expiration} onValueChange={setExpiration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Never</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300"
                  onClick={handleCreate}
                  disabled={createKey.isPending || selectedPermissions.length === 0}
                >
                  {createKey.isPending ? "Creating..." : "Create Key"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border-gray-100">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={3} />
            </div>
          ) : keys && keys.length > 0 ? (
            <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono text-sm">{key.keyPrefix}...</TableCell>
                    <TableCell>{key.name || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs rounded-full">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(key.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.lastUsedAt
                        ? format(new Date(key.lastUsedAt), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {key.expiresAt
                        ? format(new Date(key.expiresAt), "MMM d, yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeKey.mutate(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <EmptyState
              icon={Key}
              title="No API keys yet"
              description="Create an API key to integrate PackOptimize with your WMS or Shopify store."
              actionLabel="Create API Key"
              onAction={() => setDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
