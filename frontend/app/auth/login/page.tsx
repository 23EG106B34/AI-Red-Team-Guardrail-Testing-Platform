import { AuthCard } from "@/components/auth-card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 security-grid">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.28),transparent_55%)]" />
      <AuthCard mode="login" />
    </main>
  );
}
