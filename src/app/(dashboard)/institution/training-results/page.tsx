"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

export default function TrainingResultsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Training Results
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage training results for seafarers via file upload.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/institution/training-results/upload")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Results
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/institution/training-upload")}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Bulk upload
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training results</CardTitle>
          <CardDescription>
            Upload training result files (Excel or CSV) using the buttons above. The API processes each file and returns how many rows were saved and any row-level errors. There is no separate list endpoint; use Upload Results or Bulk upload to submit files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Upload training result files to record seafarer training. Use the required columns: Batch no, Seafarer id (SIN), Seafarer name, Training id (GUID), Training name, Status, Certificate id, Certificate issuance date, Certificate expiry, etc.
            </p>
            <Button
              onClick={() => router.push("/institution/training-results/upload")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
