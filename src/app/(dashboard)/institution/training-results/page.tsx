"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Eye,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getTrainingResults,
  TRAINING_RESULT_VIEW_KEY,
  type TrainingResultDto,
} from "@/lib/services/training-results-service";
import { formatDate } from "@/lib/utils";

function getRowId(row: TrainingResultDto): string {
  if (row.resultId) return row.resultId;
  return `${row.sin ?? ""}-${row.certificateId ?? ""}-${row.date ?? ""}-${row.uploadId ?? ""}`.trim() || "row";
}

export default function TrainingResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<TrainingResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const response = await getTrainingResults();
      if (response.success && response.data) {
        setResults(response.data);
      } else if (!response.success) {
        toast.error(response.message ?? "Failed to load training results");
      }
    } catch (error) {
      console.error("Failed to load training results:", error);
      toast.error("Failed to load training results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecord = (row: TrainingResultDto) => {
    try {
      sessionStorage.setItem(TRAINING_RESULT_VIEW_KEY, JSON.stringify(row));
      router.push("/institution/training-results/view");
    } catch (e) {
      toast.error("Could not open record");
    }
  };

  const columns: DataTableColumn<TrainingResultDto>[] = [
    {
      id: "seafarerName",
      header: "Seafarer",
      accessorKey: "seafarerName",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.seafarerName ?? "—"}</p>
          {row.sin && (
            <p className="text-xs text-muted-foreground">SIN: {row.sin}</p>
          )}
        </div>
      ),
    },
    {
      id: "trainingName",
      header: "Training",
      accessorKey: "trainingName",
      cell: ({ row }) => (
        <span className="text-sm">{row.trainingName ?? "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span className="text-sm">{row.status ?? "—"}</span>
      ),
    },
    {
      id: "certificateId",
      header: "Certificate ID",
      accessorKey: "certificateId",
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.certificateId ?? "—"}</span>
      ),
    },
    {
      id: "certificateIssuanceDate",
      header: "Issued",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.certificateIssuanceDate
            ? formatDate(row.certificateIssuanceDate)
            : "—"}
        </span>
      ),
    },
    {
      id: "certificateExpiry",
      header: "Expiry",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.certificateExpiry
            ? formatDate(row.certificateExpiry)
            : "—"}
        </span>
      ),
    },
    {
      id: "batchNo",
      header: "Batch",
      accessorKey: "batchNo",
      cell: ({ row }) => (
        <span className="text-sm">{row.batchNo ?? "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewRecord(row)}>
              <Eye className="mr-2 h-4 w-4" />
              View record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Training Results"
          description="View and manage training results for your institution"
          actions={
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
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Training results
          </CardTitle>
          <CardDescription>
            All training results submitted for your institution. Use Upload Results or Bulk upload to add new records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No training results"
              description="Upload training result files (Excel or CSV) using the buttons above to see records here."
              action={{
                label: "Upload Results",
                onClick: () => router.push("/institution/training-results/upload"),
              }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={results}
              getRowId={getRowId}
              searchable={true}
              searchPlaceholder="Search by name, training, certificate..."
              emptyMessage="No training results found"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
