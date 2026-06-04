export type Role = "user" | "researcher" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type AttackPrompt = {
  id: string;
  name: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  prompt: string;
  guardrail_hint: string;
};

export type TestRun = {
  id: string;
  target_model: string;
  status: string;
  risk_score: number;
  attack_success_rate: number;
  hallucination_rate: number;
  latency_ms: number;
  estimated_cost: number;
  recommendation: string;
  created_at: string;
};

export type ReportRecord = {
  id: string;
  test_run_id: string;
  title: string;
  pdf_url: string;
  docx_url: string;
  created_at: string;
};

export type Analytics = {
  totals: {
    tests: number;
    critical: number;
    average_risk: number;
    cost: number;
  };
  trends: Array<{ date: string; risk: number; success: number; hallucination: number; latency: number }>;
  models: Array<{ model: string; risk: number; cost: number; latency: number }>;
  guardrails: Array<{ name: string; effectiveness: number }>;
};

export type ApiKey = {
  id: string;
  provider: string;
  key_preview: string;
  created_at: string;
};
