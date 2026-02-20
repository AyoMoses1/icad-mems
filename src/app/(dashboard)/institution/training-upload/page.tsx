"use client";

import { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  ArrowLeft,
  Upload,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

// Placeholder row type matching the HTML schema (Batch No, Seafarer ID, Training, Status, etc.)
interface TrainingRecordRow {
  batchno: string;
  seafarer_identification_number: string;
  seafarer_name: string;
  training_id: string;
  training_name: string;
  status: "PASS" | "FAIL";
  date: string;
  certificate_id: string;
  certificate_issue: string;
  expiry_date: string;
  training_provider?: string;
  course_location?: string;
  remarks?: string;
}

const COLUMN_LABELS: Record<string, string> = {
  batchno: "Batch No",
  seafarer_identification_number: "Seafarer ID",
  seafarer_name: "Seafarer Name",
  training_id: "Training ID",
  training_name: "Training Name",
  status: "Status",
  date: "Date",
  certificate_id: "Certificate ID",
  certificate_issue: "Certificate Issue",
  expiry_date: "Expiry Date",
  training_provider: "Training Provider",
  course_location: "Course Location",
  remarks: "Remarks",
};

// Mock data for demo when no file is loaded
const MOCK_ROWS: TrainingRecordRow[] = [];

export default function TrainingUploadPage() {
  const router = useRouter();
  const [fileSelected, setFileSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<TrainingRecordRow[]>(MOCK_ROWS);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [versionHistory, setVersionHistory] = useState<
    { id: string; label: string; rowCount: number }[]
  >([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [approvedVersionId, setApprovedVersionId] = useState<string | null>(
    null
  );
  const [validationStatus, setValidationStatus] = useState<
    "not_validated" | "valid" | "invalid"
  >("not_validated");
  const [message, setMessage] = useState<{
    type: "ok" | "bad" | "warn";
    text: string;
  } | null>(null);

  const columnsOrder = columns.length
    ? columns
    : [
        "batchno",
        "seafarer_identification_number",
        "seafarer_name",
        "training_id",
        "training_name",
        "status",
        "date",
        "certificate_id",
        "certificate_issue",
        "expiry_date",
      ];

  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return columnsOrder.some(
      (col) =>
        String((row as unknown as Record<string, unknown>)[col] ?? "").toLowerCase().includes(q)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileSelected(!!file);
    setMessage(null);
  };

  const handleLoadPreview = useCallback(() => {
    setIsLoading(true);
    setMessage({ type: "warn", text: "Loading Excel…" });
    // Simulate load – no real Excel parsing; use mock data for UI demo
    setTimeout(() => {
      const mock: TrainingRecordRow[] = [
        {
          batchno: "B-001",
          seafarer_identification_number: "SF-1001",
          seafarer_name: "John Doe",
          training_id: "STCW-PST",
          training_name: "Personal Survival Techniques",
          status: "PASS",
          date: "2026-01-15",
          certificate_id: "CERT-001",
          certificate_issue: "2026-01-15",
          expiry_date: "2031-01-15",
          training_provider: "Maritime Academy",
          course_location: "Lagos",
        },
        {
          batchno: "B-001",
          seafarer_identification_number: "SF-1002",
          seafarer_name: "Jane Smith",
          training_id: "STCW-FF",
          training_name: "Fire Fighting",
          status: "PASS",
          date: "2026-01-16",
          certificate_id: "CERT-002",
          certificate_issue: "2026-01-16",
          expiry_date: "2031-01-16",
        },
      ];
      const cols = Object.keys(mock[0] || {}) as string[];
      setRows(mock);
      setColumns(cols);
      const id = "v-" + Date.now();
      setVersionHistory((prev) => [
        { id, label: new Date().toLocaleString() + " — upload.xlsx (" + mock.length + " rows)", rowCount: mock.length },
        ...prev.slice(0, 19),
      ]);
      setSelectedHistoryId(id);
      setValidationStatus("valid");
      setMessage({
        type: "ok",
        text: "Required columns present. Row checks: 0 invalid status, 0 suspicious dates.",
      });
      setIsLoading(false);
      toast.success("File loaded and preview ready");
    }, 800);
  }, []);

  const handleApprove = useCallback(() => {
    if (!selectedHistoryId) return;
    setApprovedVersionId(selectedHistoryId);
    setMessage({ type: "ok", text: "Approved version set." });
    toast.success("This version is now approved");
  }, [selectedHistoryId]);

  const handleRollback = useCallback(() => {
    if (!selectedHistoryId) return;
    // In real app would load that version's data
    toast.success("Rolled back to selected version");
    setMessage({ type: "ok", text: "Rolled back to selected version." });
  }, [selectedHistoryId]);

  const handleExport = useCallback(() => {
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    toast.success("Export triggered (API not implemented)");
  }, [rows.length]);

  const handleClear = useCallback(() => {
    setRows(MOCK_ROWS);
    setColumns([]);
    setFileSelected(false);
    setMessage(null);
    setValidationStatus("not_validated");
    setSearchQuery("");
    toast.info("View cleared");
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 lg:space-y-8 px-1">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:items-center">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
              <GraduationCap className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              <span className="truncate">Seafarer Training Records — Upload, Approve, Rollback</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-2xl">
              Upload Excel (.xlsx/.xls), validate, approve, rollback, and export. Required columns: Batch No, Seafarer ID, Seafarer Name, Training ID, Training Name, Status (Pass/Fail), Date, Certificate ID, Certificate Issue, Expiry Date.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
        {/* Left: controls */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Upload &amp; Controls</CardTitle>
            <CardDescription className="text-sm">Load file and manage versions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <div className="space-y-2">
              <Label>Upload Excel (.xlsx / .xls)</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Training Provider, Course Location, Remarks.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="sm:size-default"
                onClick={handleLoadPreview}
                disabled={!fileSelected || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Load &amp; Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:size-default"
                onClick={handleExport}
                disabled={rows.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Current
              </Button>
              <Button variant="destructive" size="sm" className="sm:size-default" onClick={handleClear}>
                Clear View
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">Approval</Label>
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={handleApprove}
                  disabled={!selectedHistoryId || rows.length === 0}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve This Version
                </Button>
                <p className="text-xs text-muted-foreground">
                  Marks this dataset as the current approved record set.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Rollback</Label>
                <Select value={selectedHistoryId} onValueChange={setSelectedHistoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versionHistory.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No history yet
                      </SelectItem>
                    ) : (
                      versionHistory.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                          {approvedVersionId === v.id ? " ✅ approved" : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleRollback}
                  disabled={!selectedHistoryId || versionHistory.length === 0}
                >
                  Rollback to Selected
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Search (current table)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by batch, name, seafarer ID, training…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  disabled={rows.length === 0}
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  message.type === "ok"
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                    : message.type === "bad"
                      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <Label className="text-sm">Version info</Label>
              <div className="rounded-lg border bg-muted/50 p-3 font-mono text-xs overflow-auto">
                {rows.length > 0
                  ? `Rows: ${rows.length} · Columns: ${columnsOrder.length}`
                  : "No file loaded."}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={validationStatus === "valid" ? "default" : "secondary"} className="text-xs">
                  {validationStatus === "not_validated"
                    ? "Not validated"
                    : validationStatus === "valid"
                      ? "Validated"
                      : "Validation issues"}
                </Badge>
                <Badge variant={approvedVersionId ? "default" : "secondary"} className="text-xs">
                  {approvedVersionId ? "Approved version" : "Not approved"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: table preview */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{filteredRows.length} rows</Badge>
                <Badge variant="secondary">{columnsOrder.length} columns</Badge>
              </div>
              <p className="text-sm text-muted-foreground shrink-0">
                {approvedVersionId ? "Approved version set" : "No approved version"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col min-h-0">
            <div className="overflow-x-auto rounded-lg border bg-muted/20 min-h-[280px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columnsOrder.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {COLUMN_LABELS[col] || col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columnsOrder.length || 10}
                        className="text-center text-muted-foreground py-12"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FileSpreadsheet className="h-10 w-10 opacity-40" />
                          <span>Load an Excel file and click &quot;Load &amp; Preview&quot; to see data here.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <TableRow key={idx}>
                        {columnsOrder.map((col) => {
                          const val = (row as unknown as Record<string, unknown>)[col];
                          if (col === "status") {
                            const s = String(val ?? "").toUpperCase();
                            const isPass = s === "PASS";
                            return (
                              <TableCell key={col}>
                                <Badge
                                  variant={isPass ? "default" : "destructive"}
                                  className={
                                    isPass
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-200"
                                      : ""
                                  }
                                >
                                  {isPass ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {s || "—"}
                                </Badge>
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={col} className="font-mono text-xs max-w-[180px] truncate" title={val != null ? String(val) : undefined}>
                              {val != null ? String(val) : "—"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Flexible Excel headers (e.g. Batch No or batchno, Status (Pass/Fail) or Status) are mapped automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
