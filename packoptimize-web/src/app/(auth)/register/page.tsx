"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Intersect, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  tenantName: z.string().min(2, "Tenant name must be at least 2 characters"),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    tenantName: "",
    tenantSlug: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const updateField = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    if (field === "tenantName") {
      updated.tenantSlug = generateSlug(value);
    }
    setFormData(updated);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await register({
        tenantName: formData.tenantName,
        tenantSlug: formData.tenantSlug,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Account created successfully");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : "Registration failed";
      toast.error(message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]";

  return (
    <Card className="w-full max-w-md rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B4228]">
          <Intersect size={24} className="text-[#91E440]" weight="bold" />
        </div>
        <CardTitle className="text-2xl text-[#0B4228]">Create your account</CardTitle>
        <CardDescription>
          Start optimizing your packaging today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Company Name</Label>
            <Input id="tenantName" placeholder="Acme Corp" value={formData.tenantName} onChange={(e) => updateField("tenantName", e.target.value)} className={inputCls} />
            {errors.tenantName && <p className="text-sm text-destructive">{errors.tenantName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Company Slug</Label>
            <Input id="tenantSlug" placeholder="acme-corp" value={formData.tenantSlug} onChange={(e) => updateField("tenantSlug", e.target.value)} className={inputCls} />
            {errors.tenantSlug && <p className="text-sm text-destructive">{errors.tenantSlug}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@company.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className={inputCls} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Min 8 characters" value={formData.password} onChange={(e) => updateField("password", e.target.value)} className={inputCls} />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} className={inputCls} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" className="w-full bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 min-h-[44px]" disabled={loading}>
            {loading && <SpinnerGap size={16} className="mr-2 animate-spin" />}
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0B4228] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
