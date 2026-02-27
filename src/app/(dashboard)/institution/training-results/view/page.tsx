"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, FileText, MapPin, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TRAINING_RESULT_VIEW_KEY,
  type TrainingResultDto,
} from "@/lib/services/training-results-service";
import { formatDate } from "@/lib/utils";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4 sm:py-3 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm sm:col-span-2">{value ?? "—"}</dd>
    </div>
  );
}

export default function TrainingResultViewPage() {
  const [record, setRecord] = useState<TrainingResultDto | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(TRAINING_RESULT_VIEW_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as TrainingResultDto;
        setRecord(parsed);
      }
    } catch {
      setRecord(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="View training result"
          description="Select a record from the training results list to view details"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No record selected. Open a result from the training results list.
            </p>
            <Button asChild variant="outline">
              <Link href="/institution/training-results">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to training results
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training result"
        description="Details of the selected training result"
        actions={
          <Button variant="outline" asChild>
            <Link href="/institution/training-results">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Seafarer & training
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="text-sm">
              <DetailRow label="Seafarer name" value={record.seafarerName} />
              <DetailRow label="SIN" value={record.sin} />
              <DetailRow label="Training name" value={record.trainingName} />
              <DetailRow label="Status" value={record.status} />
              <DetailRow label="Training provider" value={record.trainingProvider} />
              <DetailRow label="Batch no" value={record.batchNo} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Certificate & dates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="text-sm">
              <DetailRow label="Certificate ID" value={record.certificateId} />
              <DetailRow
                label="Certificate issuance date"
                value={
                  record.certificateIssuanceDate
                    ? formatDate(record.certificateIssuanceDate)
                    : null
                }
              />
              <DetailRow
                label="Certificate expiry"
                value={
                  record.certificateExpiry
                    ? formatDate(record.certificateExpiry)
                    : null
                }
              />
              <DetailRow
                label="Date"
                value={record.date ? formatDate(record.date) : null}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Location & notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="text-sm">
            <DetailRow label="Course location" value={record.courseLocation} />
            <DetailRow label="Remarks" value={record.remarks} />
            <DetailRow
              label="Institution STCW accreditation ID"
              value={record.institutionSTCWAccreditationId}
            />
            <DetailRow label="Training status ID" value={record.trainingStatusId} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
