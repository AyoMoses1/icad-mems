"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  ArrowLeft,
  Upload,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadTrainingResult,
  type SeafarerTrainingUploadResultDto,
  type SeafarerTrainingRowErrorDto,
} from "@/lib/services/seafarer-employment-training-service";

const ACCEPT = ".xlsx,.xls,.csv";
const MAX_MB = 5;

export default function TrainingUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SeafarerTrainingUploadResultDto | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    setResult(null);
    if (!chosen) {
      setFile(null);
      return;
    }
    const validExt = [".xlsx", ".xls", ".csv"].some((ext) =>
      chosen.name.toLowerCase().endsWith(ext)
    );
    if (!validExt) {
      toast.error("Allowed formats: .xlsx, .xls, .csv");
      setFile(null);
      return;
    }
    if (chosen.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB} MB`);
      setFile(null);
      return;
    }
    setFile(chosen);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setIsSubmitting(true);
    setResult(null);
    try {
      const data = await uploadTrainingResult(file);
      setResult(data);
      if (data.errorCount === 0) {
        toast.success(`Upload complete: ${data.savedCount} row(s) saved.`);
      } else {
        toast.warning(
          `${data.savedCount} saved, ${data.errorCount} error(s). Check details below.`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
              <GraduationCap className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              <span className="truncate">Seafarer Training Records — Upload</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-2xl">
              Upload Excel (.xlsx/.xls) or CSV. Max {MAX_MB} MB. Required columns: Batch no, Seafarer id (SIN), Seafarer name, Training id (GUID), Training name, Status, Certificate id, Certificate issuance date, Certificate expiry, etc.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload file
            </CardTitle>
            <CardDescription>
              Select a file and click Upload to send training results to the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>File (.xlsx / .xls / .csv)</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!file || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/institution/training-results")}
              >
                View training results
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Upload result
              </CardTitle>
              <CardDescription>
                {result.fileName} · {result.totalRows} row(s) · {result.savedCount} saved · {result.errorCount} error(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <span className="text-sm font-medium">Total: {result.totalRows}</span>
                <span className="text-sm text-green-600 font-medium">Saved: {result.savedCount}</span>
                {result.errorCount > 0 && (
                  <span className="text-sm text-destructive font-medium">Errors: {result.errorCount}</span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Row errors:</p>
                  <ul className="rounded-lg border bg-muted/30 p-3 space-y-1 max-h-60 overflow-auto">
                    {result.errors.map((err: SeafarerTrainingRowErrorDto, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <span>
                          Row {err.rowIndex}: {err.message}
                          {err.column ? ` (${err.column})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
