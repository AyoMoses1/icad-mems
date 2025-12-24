"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
import {
  getAccreditationsUnderReview,
  auditAccreditation,
  type AccreditationDto,
} from "@/lib/services/admin-review-service";

export default function AdminAccreditationsReviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accreditations, setAccreditations] = useState<AccreditationDto[]>([]);

  const loadAccreditations = async () => {
    setIsLoading(true);
    try {
      const res = await getAccreditationsUnderReview({
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

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await auditAccreditation(id, { approved: true });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Accreditation approved");
        await loadAccreditations();
      } else {
        toast.error(res.message || "Approval failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Approval failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accreditations Under Review"
        description="Review and approve accreditation applications"
      />

      <Card>
        <CardHeader>
          <CardTitle>Under Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accreditations.length === 0 ? (
            <EmptyState title="No accreditations under review" />
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
                      {acc.status || "pending"}
                    </div>
                    {acc.submittedAt && (
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(acc.submittedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(acc.id)}
                      disabled={isSubmitting}
                    >
                      Approve
                    </Button>
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
