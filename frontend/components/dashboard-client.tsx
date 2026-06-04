"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, Cpu, DollarSign, Gauge } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Analytics } from "@/types/domain";

export function DashboardClient() {
  const { token } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    if (token) api.dashboard(token).then(setData);
  }, [token]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">AI security command center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Guardrail Risk Dashboard</h1>
        </div>
        {!data ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Metric icon={Cpu} label="Tests" value={data.totals.tests.toString()} />
              <Metric icon={Gauge} label="Average risk" value={`${data.totals.average_risk}/100`} />
              <Metric icon={AlertTriangle} label="Critical findings" value={data.totals.critical.toString()} />
              <Metric icon={DollarSign} label="Cost tracked" value={formatCurrency(data.totals.cost)} />
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Risk, attack success, and hallucination trends</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trends}>
                      <defs>
                        <linearGradient id="risk" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="risk" stroke="#4F46E5" fill="url(#risk)" />
                      <Area type="monotone" dataKey="success" stroke="#06B6D4" fill="transparent" />
                      <Area type="monotone" dataKey="hallucination" stroke="#84CC16" fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Guardrail effectiveness</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.guardrails}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="effectiveness" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Model comparison</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-3">Model</th>
                      <th>Risk</th>
                      <th>Latency</th>
                      <th>Cost</th>
                      <th>Deployment signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.models.map((model, index) => (
                      <tr key={`${model.model}-${index}`} className="border-t">
                        <td className="py-3 font-semibold">{model.model}</td>
                        <td>{model.risk}/100</td>
                        <td>{model.latency}ms</td>
                        <td>{formatCurrency(model.cost)}</td>
                        <td>{model.risk >= 80 ? "Block release" : model.risk >= 55 ? "Needs hardening" : "Release candidate"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.models.length === 0 ? (
                  <p className="py-10 text-center text-muted-foreground">Run tests against Gemini, OpenAI, Groq, or Claude-compatible endpoints to compare model risk.</p>
                ) : null}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-md bg-secondary/15 text-secondary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
