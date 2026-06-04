import type {
  Analytics,
  ApiKey,
  AttackPrompt,
  AuthResponse,
  ReportRecord,
  TestRun,
  User
} from "@/types/domain";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store"
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(detail.detail ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(`Failed to connect to API at ${API_URL}. Please ensure the backend server is running.`);
    }
    throw error;
  }
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
  me: (token: string) => request<User>("/auth/me", { token }),
  dashboard: (token: string) => request<Analytics>("/analytics/summary", { token }),
  prompts: (token: string) => request<AttackPrompt[]>("/attacks/library", { token }),
  runTest: (token: string, body: Record<string, unknown>) =>
    request<TestRun>("/tests/run", { method: "POST", token, body: JSON.stringify(body) }),
  tests: (token: string) => request<TestRun[]>("/tests/history", { token }),
  reports: (token: string) => request<ReportRecord[]>("/reports", { token }),
  adminUsers: (token: string) => request<User[]>("/admin/users", { token }),
  apiKeys: (token: string) => request<ApiKey[]>("/api-keys", { token }),
  saveApiKey: (token: string, body: { provider: string; key: string }) =>
    request<ApiKey>("/api-keys", { method: "POST", token, body: JSON.stringify(body) })
};
