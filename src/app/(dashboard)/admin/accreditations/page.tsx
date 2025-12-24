"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getAllAccreditations,
  type AccreditationDto,
} from "@/lib/services/admin-review-service";

export default function AdminAccreditationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [accreditations, setAccreditations] = useState<AccreditationDto[]>([]);

  const loadAccreditations = async () => {
    setIsLoading(true);
    try {
      const res = await getAllAccreditations({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || "Failed to load accreditations");
      setAccreditations(res.data?.items || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load accreditations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccreditations();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Accreditations"
        description="View all accreditation applications"
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Accreditations</CardTitle>
          <Button variant="outline" size="sm" onClick={loadAccreditations}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {accreditations.length === 0 ? (
            <EmptyState title="No accreditations found" />
          ) : (
            <div className="grid gap-3">
              {accreditations.map((acc) => (
                <div
                  key={acc.id}
                  className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {acc.institutionName ||
                        acc.institutionId ||
                        "Institution"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {acc.accreditationType || "Type"} · Status:{" "}
                      {acc.status || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {acc.id}
                    </div>
                    {acc.submittedAt && (
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(acc.submittedAt).toLocaleString()}
                      </div>
                    )}
                    {acc.finalizedAt && (
                      <div className="text-xs text-muted-foreground">
                        Finalized: {new Date(acc.finalizedAt).toLocaleString()}
                      </div>
                    )}
                    {acc.reviewedAt && (
                      <div className="text-xs text-muted-foreground">
                        Reviewed: {new Date(acc.reviewedAt).toLocaleString()}
                      </div>
                    )}
                    {acc.activatedAt && (
                      <div className="text-xs text-muted-foreground">
                        Activated: {new Date(acc.activatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
