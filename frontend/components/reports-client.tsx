"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Eye, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ReportRecord } from "@/types/domain";

export function ReportsClient() {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [preview, setPreview] = useState<ReportRecord | null>(null);

  useEffect(() => {
    if (token) api.reports(token).then(setReports);
  }, [token]);

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Generated evidence reports</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col justify-between gap-3 rounded-lg border bg-background/60 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">{report.title}</p>
                <p className="text-sm text-muted-foreground">Created {formatDate(report.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(report)}>
                  <Eye className="size-4" />
                  PDF
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={report.docx_url}>
                    <Download className="size-4" />
                    DOCX
                  </a>
                </Button>
              </div>
            </div>
          ))}
          {reports.length === 0 ? <p className="py-12 text-center text-muted-foreground">No reports generated yet.</p> : null}
        </CardContent>
      </Card>
      <Dialog.Root open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[82vh] w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-card shadow-glow">
            <div className="flex items-center justify-between border-b p-3">
              <Dialog.Title className="font-semibold">{preview?.title}</Dialog.Title>
              <div className="flex items-center gap-2">
                {preview ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={preview.pdf_url} download>
                      <Download className="size-4" />
                      Download
                    </a>
                  </Button>
                ) : null}
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Close report preview">
                    <X className="size-4" />
                  </Button>
                </Dialog.Close>
              </div>
            </div>
            {preview ? <iframe title={preview.title} src={preview.pdf_url} className="h-full w-full bg-background" /> : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AppShell>
  );
}
