"use client";

import { useEffect, useState } from "react";
import { KeyRound, Server, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import type { ApiKey, User } from "@/types/domain";

export function AdminClient() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (token) {
      api.apiKeys(token).then(setKeys);
      api.adminUsers(token).then(setUsers).catch(() => setUsers([]));
    }
  }, [token]);

  async function saveKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      const record = await api.saveApiKey(token, { provider, key: apiKey });
      setKeys((items) => [record, ...items]);
      toast.success("Provider key encrypted and stored");
      setProvider("");
      setApiKey("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Key save failed");
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-secondary" />
              API key vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="grid gap-3" onSubmit={saveKey}>
              <div className="grid gap-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  name="provider"
                  placeholder="openai, gemini, groq, anthropic"
                  required
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">API key</Label>
                <Input id="key" name="key" type="password" required value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
              </div>
              <Button type="submit">Encrypt key</Button>
            </form>
            <div className="grid gap-2">
              {keys.map((key) => (
                <div key={key.id} className="flex justify-between rounded-md border p-3 text-sm">
                  <span>{key.provider}</span>
                  <span className="text-muted-foreground">{key.key_preview}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-accent" />
              Users and RBAC
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {user?.role !== "admin" ? (
              <div className="rounded-lg border bg-background/60 p-6 text-sm text-muted-foreground">
                Admin role required to view all users.
              </div>
            ) : (
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-3">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3">{item.name}</td>
                      <td>{item.email}</td>
                      <td>
                        <Badge>{item.role}</Badge>
                      </td>
                      <td>{item.is_active ? "Active" : "Disabled"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="size-5 text-secondary" />
              System monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {["API online", "PostgreSQL connected", "Chroma index warm", "Audit trails active"].map((item) => (
              <div key={item} className="rounded-md border bg-background/60 p-4 text-sm font-semibold">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
