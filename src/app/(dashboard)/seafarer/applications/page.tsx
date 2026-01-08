"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreVertical, Search, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  LoadingSpinner,
  EmptyState,
  DataTable,
  DataTableColumn,
} from "@/components/shared";
import { formatDate } from "@/lib/utils";
import {
  getMyApplications,
  getApplicationById,
  type ApplicationDto,
} from "@/lib/services/application-service";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-300",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800 border-orange-300",
  PAID: "bg-cyan-100 text-cyan-800 border-cyan-300",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function SeafarerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Use Applications/my-applications endpoint
      const response = await getMyApplications();

      const ok = response.success ?? (response as any).successful;
      if (!ok) {
        toast.error(response.message || "Failed to load applications");
        return;
      }

      const items = response.data || [];
      setApplications(items);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplicationDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await getApplicationById(id);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSelectedApplication(response.data);
        setDetailDialogOpen(true);
      } else {
        toast.error(response.message || "Failed to load application details");
      }
    } catch (error: any) {
      console.error("Error loading application detail:", error);
      toast.error(error.message || "Failed to load application details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter || app.applicationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: DataTableColumn<ApplicationDto>[] = [
    {
      id: "applicationId",
      header: "Application ID",
      accessorKey: "id",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs">
          {row.id?.slice(0, 8).toUpperCase() || "N/A"}
        </span>
      ),
    },
    {
      id: "service",
      header: "Service",
      accessorKey: "serviceName",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.serviceName || "N/A"}</p>
          {row.remarks && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.remarks}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.status || row.applicationStatus || "DRAFT";
        return (
          <Badge
            variant="outline"
            className={STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}
          >
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      id: "date",
      header: "Date Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.createdAt || row.dateCreated
            ? formatDate(row.createdAt || row.dateCreated || "")
            : "N/A"}
        </span>
      ),
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.hasPayment || row.isPaid ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Paid
            </Badge>
          ) : row.hasInvoice ? (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Pending
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadApplicationDetail(row.id || "")}
            disabled={isLoadingDetail}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="View and manage all your service applications"
        action={
          <Button onClick={() => router.push("/seafarer/services")}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        }
      />

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="PAYMENT_PENDING">Payment Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No applications found"
                description={
                  searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "You haven't created any applications yet"
                }
                action={
                  <Button onClick={() => router.push("/seafarer/services")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Application
                  </Button>
                }
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredApplications}
              isLoading={isLoading}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : selectedApplication ? (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    STATUS_COLORS[
                      selectedApplication.status ||
                        selectedApplication.applicationStatus ||
                        "DRAFT"
                    ] || "bg-gray-100"
                  }
                >
                  {(
                    selectedApplication.status ||
                    selectedApplication.applicationStatus ||
                    "DRAFT"
                  ).replace(/_/g, " ")}
                </Badge>
                {(selectedApplication.hasPayment || selectedApplication.isPaid) && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Payment Complete
                  </Badge>
                )}
              </div>

              {/* Application Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Application ID</Label>
                  <p className="font-mono text-sm">
                    {selectedApplication.id?.slice(0, 13).toUpperCase() || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="font-medium">{selectedApplication.serviceName || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date Created</Label>
                  <p className="text-sm">
                    {selectedApplication.createdAt || selectedApplication.dateCreated
                      ? formatDate(
                          selectedApplication.createdAt || selectedApplication.dateCreated || ""
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date Submitted</Label>
                  <p className="text-sm">
                    {selectedApplication.applicationDate || selectedApplication.submissionDate
                      ? formatDate(
                          selectedApplication.applicationDate ||
                            selectedApplication.submissionDate ||
                            ""
                        )
                      : "Not submitted"}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {selectedApplication.remarks && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Remarks</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedApplication.remarks}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {selectedApplication.requirements && selectedApplication.requirements.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Requirements</Label>
                  <div className="space-y-2">
                    {selectedApplication.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                      >
                        <span>{req.requirementName || "Requirement"}</span>
                        {req.isSubmitted ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selectedApplication.hasInvoice && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <div className="p-3 bg-muted rounded-md space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Invoice Status:</span>
                      <span className="font-medium">
                        {selectedApplication.invoiceStatus || "Generated"}
                      </span>
                    </div>
                    {selectedApplication.paymentRef && (
                      <div className="flex justify-between text-sm">
                        <span>Payment Reference:</span>
                        <span className="font-mono text-xs">
                          {selectedApplication.paymentRef}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No details available</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication && (
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  router.push(`/seafarer/applications/${selectedApplication.id}`);
                }}
              >
                View Full Details
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
