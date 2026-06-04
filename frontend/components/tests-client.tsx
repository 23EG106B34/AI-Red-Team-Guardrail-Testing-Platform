"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Play, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { TestRun } from "@/types/domain";

export function TestsClient() {
  const { token } = useAuth();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) api.tests(token).then(setRuns);
  }, [token]);

  async function run(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const test = await api.runTest(token, {
        target_model: form.get("target_model"),
        target_url: form.get("target_url"),
        policy: form.get("policy"),
        categories: ["prompt_injection", "jailbreak", "toxicity", "hallucination", "data_leakage"]
      });
      setRuns((items) => [test, ...items]);
      toast.success("Red-team workflow completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-secondary" />
              Launch red-team test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={run}>
              <div className="grid gap-2">
                <Label htmlFor="target_model">Target model</Label>
                <Input id="target_model" name="target_model" defaultValue="gpt-4o-mini" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target_url">Target endpoint</Label>
                <Input id="target_url" name="target_url" placeholder="https://api.vendor.com/v1/chat/completions" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="policy">Guardrail policy</Label>
                <Input id="policy" name="policy" defaultValue="Block data exfiltration, toxic content, unsafe jailbreaks, and hallucinated citations." />
              </div>
              <Button disabled={loading} type="submit">
                <Play className="size-4" />
                {loading ? "Running agents..." : "Run multi-agent test"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Test history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-3">Model</th>
                  <th>Risk</th>
                  <th>Attack success</th>
                  <th>Hallucination</th>
                  <th>Latency</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t">
                    <td className="py-3 font-medium">{run.target_model}</td>
                    <td>{run.risk_score}</td>
                    <td>{run.attack_success_rate}%</td>
                    <td>{run.hallucination_rate}%</td>
                    <td>{run.latency_ms}ms</td>
                    <td>
                      <Badge className="border-accent/40 text-accent">{run.status}</Badge>
                    </td>
                    <td>{formatDate(run.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {runs.length === 0 ? <p className="py-12 text-center text-muted-foreground">No tests yet. Launch one to populate audit history.</p> : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
