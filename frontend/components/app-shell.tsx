"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect } from "react";
import {
  Activity,
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Swords,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@/lib/utils";

const baseNav: Array<{ href: string; label: string; icon: typeof LayoutDashboard }> = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tests", label: "Red-Team Tests", icon: Swords },
  { href: "/library", label: "Attack Library", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: FileText }
];

const adminNav = { href: "/admin", label: "Admin", icon: Users };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace("/auth/login");
  }, [ready, router, user]);

  if (!ready || !user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background security-grid">
      <CommandPalette />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card/75 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-2 py-3">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Shield className="size-5" />
            </span>
            <span>
              <span className="block font-bold">Sentinel Red AI</span>
              <span className="text-xs text-muted-foreground">Guardrail operations</span>
            </span>
          </Link>
          <nav className="mt-8 grid gap-1">
            {[
              ...baseNav,
              ...(user?.role === "admin" ? [adminNav] : [])
            ].map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-lg border bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4 text-accent" />
              Live monitoring
            </div>
            <p className="mt-2 text-xs text-muted-foreground">RBAC, audit logging, prompt injection checks, and rate limits enabled.</p>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/75 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="size-4" />
            </Button>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              title="Logout"
              onClick={() => {
                logout();
                router.replace("/auth/login");
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
