import { AuthCard } from "@/components/auth-card";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 security-grid">
      <AuthCard mode="forgot" />
    </main>
  );
}
