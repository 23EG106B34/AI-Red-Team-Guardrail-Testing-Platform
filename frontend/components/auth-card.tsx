"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export function AuthCard({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");

    try {
      if (mode === "login") await auth.login(email, password);
      if (mode === "signup") await auth.signup(name, email, password);
      if (mode === "forgot") {
        const response = await api.forgotPassword({ email });
        toast.success(response.message);
        router.push("/auth/login");
        return;
      }
      toast.success("Secure session established");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your workspace" : "Reset access";
  const description =
    mode === "forgot"
      ? "Enter your email to receive a password reset workflow."
      : "Secure access for AI red-team, guardrail, and compliance workflows.";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 grid size-12 place-items-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" minLength={2} required autoComplete="name" />
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {mode !== "forgot" ? (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required autoComplete="current-password" />
            </div>
          ) : null}
          <Button disabled={loading} type="submit" className="w-full">
            {loading ? "Securing..." : mode === "login" ? "Login" : mode === "signup" ? "Signup" : "Send reset link"}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          {mode !== "login" ? <Link href="/auth/login">Login</Link> : <Link href="/auth/signup">Create account</Link>}
          {mode !== "forgot" ? <Link href="/auth/forgot-password">Forgot password</Link> : null}
        </div>
      </CardContent>
    </Card>
  );
}
