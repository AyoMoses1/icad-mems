"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getInspectionReports,
  createInspectionReport,
  submitInspectionReport,
  approveInspectionReport,
  type InspectionReportDto,
  type CreateInspectionReportRequest,
} from "@/lib/services/inspection-service";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  DRAFT: <FileText className="h-4 w-4" />,
  SUBMITTED: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
};

export default function InspectionReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<InspectionReportDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating new report
  const [newReport, setNewReport] = useState<CreateInspectionReportRequest>({
    inspectionScheduleId: "",
    institutionId: "",
    reportStatus: "DRAFT",
    findings: "",
    recommendations: "",
    complianceScore: 0,
  });

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await getInspectionReports({
        reportStatus: statusFilter || undefined,
        pageSize: 100,
      });
      if (response.success) {
        setReports(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load inspection reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.inspectionScheduleId || !newReport.institutionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createInspectionReport(newReport);
      if (response.success) {
        toast.success("Report created successfully");
        setIsDialogOpen(false);
        setNewReport({
          inspectionScheduleId: "",
          institutionId: "",
          reportStatus: "DRAFT",
          findings: "",
          recommendations: "",
          complianceScore: 0,
        });
        loadReports();
      } else {
        toast.error(response.message || "Failed to create report");
      }
    } catch (error) {
      console.error("Failed to create report:", error);
      toast.error("Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      const response = await submitInspectionReport(reportId);
      if (response.success) {
        toast.success("Report submitted for approval");
        loadReports();
      } else {
        toast.error(response.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit report");
    }
  };

  const handleApproveReport = async (reportId: string, approved: boolean) => {
    try {
      const response = await approveInspectionReport(reportId, {
        approved,
        notes: approved ? "Report approved" : "Report needs revision",
      });
      if (response.success) {
        toast.success(approved ? "Report approved" : "Report rejected");
        loadReports();
      } else {
        toast.error(response.message || "Failed to update report");
      }
    } catch (error) {
      console.error("Failed to update report:", error);
      toast.error("Failed to update report");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getComplianceColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspection Reports"
        description="View and manage inspection reports"
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by institution or inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Inspection Report</DialogTitle>
              <DialogDescription>
                Create a new inspection report for a completed inspection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectionScheduleId">Inspection Schedule ID *</Label>
                  <Input
                    id="inspectionScheduleId"
                    placeholder="Enter schedule ID"
                    value={newReport.inspectionScheduleId}
                    onChange={(e) =>
                      setNewReport({ ...newReport, inspectionScheduleId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionId">Institution ID *</Label>
                  <Input
                    id="institutionId"
                    placeholder="Enter institution ID"
                    value={newReport.institutionId}
                    onChange={(e) =>
                      setNewReport({ ...newReport, institutionId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complianceScore">Compliance Score (0-100)</Label>
                <Input
                  id="complianceScore"
                  type="number"
                  min="0"
                  max="100"
                  value={newReport.complianceScore || ""}
                  onChange={(e) =>
                    setNewReport({
                      ...newReport,
                      complianceScore: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                  id="findings"
                  placeholder="Describe inspection findings..."
                  rows={4}
                  value={newReport.findings || ""}
                  onChange={(e) =>
                    setNewReport({ ...newReport, findings: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Enter recommendations..."
                  rows={4}
                  value={newReport.recommendations || ""}
                  onChange={(e) =>
                    setNewReport({ ...newReport, recommendations: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inspection reports found</p>
              <p className="text-sm mt-2">
                Create a new report after completing an inspection
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {report.institutionName || "Institution Report"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {report.institutionName || "Unknown"}
                        </span>
                        {report.complianceScore !== undefined && (
                          <span className={`font-medium ${getComplianceColor(report.complianceScore)}`}>
                            Score: {report.complianceScore}%
                          </span>
                        )}
                      </div>
                      {report.findings && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {report.findings}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_COLORS[report.reportStatus] || "bg-gray-100"}>
                      {STATUS_ICONS[report.reportStatus]}
                      <span className="ml-1">{report.reportStatus}</span>
                    </Badge>
                    <div className="flex gap-2">
                      {report.reportStatus === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmitReport(report.id)}
                        >
                          Submit
                        </Button>
                      )}
                      {report.reportStatus === "SUBMITTED" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleApproveReport(report.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleApproveReport(report.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/inspections/reports/${report.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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





