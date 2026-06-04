"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="glass max-w-lg rounded-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Runtime shield tripped</p>
        <h1 className="mt-3 text-3xl font-bold">Something failed safely.</h1>
        <p className="mt-3 text-muted-foreground">{error.message || "The interface hit an unexpected error."}</p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
