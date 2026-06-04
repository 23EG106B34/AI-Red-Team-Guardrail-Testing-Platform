import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Sentinel Red AI | AI Red-Team & Guardrail Testing",
    template: "%s | Sentinel Red AI"
  },
  description:
    "Enterprise AI red-team, guardrail testing, risk scoring, RAG security knowledge base, and defense recommendation platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Sentinel Red AI",
    description: "AI red-team and guardrail testing platform for secure model deployment.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
