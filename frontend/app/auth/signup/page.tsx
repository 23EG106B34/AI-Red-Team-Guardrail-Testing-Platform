import { AuthCard } from "@/components/auth-card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 security-grid">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.2),transparent_55%)]" />
      <AuthCard mode="signup" />
    </main>
  );
}
