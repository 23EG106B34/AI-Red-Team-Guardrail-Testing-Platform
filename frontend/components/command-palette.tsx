"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const baseActions: Array<{ label: string; href: string }> = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Run Red-Team Test", href: "/tests" },
  { label: "Attack Library", href: "/library" },
  { label: "Reports", href: "/reports" }
];

const adminAction = { label: "Admin Console", href: "/admin" };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-xl -translate-x-1/2 rounded-lg border bg-card p-0 shadow-glow">
        <Command className="overflow-hidden rounded-lg">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 size-4 text-muted-foreground" />
            <Command.Input
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search commands, pages, workflows..."
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-sm text-muted-foreground">No command found.</Command.Empty>
            {[...baseActions, ...(user?.role === "admin" ? [adminAction] : [])].map((action) => (
              <Command.Item
                key={action.href}
                value={action.label}
                className={cn("cursor-pointer rounded-md px-3 py-2 text-sm aria-selected:bg-muted")}
                onSelect={() => {
                  router.push(action.href as Route);
                  setOpen(false);
                }}
              >
                {action.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
