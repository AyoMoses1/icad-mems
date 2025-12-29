"use client";

import { useState, useEffect } from "react";
import { Eye, MoreVertical, Search } from "lucide-react";
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
  getPreviousCertificates,
  getPreviousCertificateById,
  type PreviousCertificateDto,
} from "@/lib/services/previous-certificates-service";

export default function SeafarerApplicationsPage() {
  const [applications, setApplications] = useState<PreviousCertificateDto[]>(
    [],
  );
  const [selectedApplication, setSelectedApplication] =
    useState<PreviousCertificateDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    loadApplications();
  }, [currentPage, searchQuery]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Use PreviousCertificates endpoint for all users
      const response = await getPreviousCertificates({
        pageNumber: currentPage,
        pageSize,
        sortDirection: "asc",
      });

      const ok = response.success ?? (response as any).successful;
      if (!ok) {
        toast.error(response.message || "Failed to load applications");
        return;
      }

      const items = response.data?.items || [];
      setApplications(items);
      setTotalPages(
        response.data?.totalNumber
          ? Math.ceil(response.data.totalNumber / pageSize)
          : 1,
      );
      setTotalCount(
        response.data?.totalNumber ?? response.data?.items?.length ?? 0,
      );
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
      const response = await getPreviousCertificateById(id);
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

  const columns: DataTableColumn<PreviousCertificateDto>[] = [
    {
      id: "certificateNumber",
      header: "Certificate Number",
      accessorKey: "certificateNumber",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.certificateNumber || `CERT-${row.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      id: "certificateType",
      header: "Certificate Type",
      accessorKey: "certificateType",
      cell: ({ row }) => (
        <span className="text-sm">{row.certificateType || "N/A"}</span>
      ),
    },
    {
      id: "issuingAuthority",
      header: "Issuing Authority",
      accessorKey: "issuingAuthority",
      cell: ({ row }) => (
        <span className="text-sm">{row.issuingAuthority || "N/A"}</span>
      ),
    },
    {
      id: "issueDate",
      header: "Issue Date",
      accessorKey: "issueDate",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.issueDate ? formatDate(row.issueDate) : "N/A"}
        </span>
      ),
    },
    {
      id: "expiryDate",
      header: "Expiry Date",
      accessorKey: "expiryDate",
      cell: ({ row }) => {
        const expiryDate = row.expiryDate ? new Date(row.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < new Date();
        return (
          <span className={`text-sm ${isExpired ? "text-destructive" : ""}`}>
            {row.expiryDate ? formatDate(row.expiryDate) : "N/A"}
            {isExpired && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => loadApplicationDetail(row.id)}
              disabled={isLoadingDetail}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Previous Certificates"
        description="View all your previous certificates and applications"
      />

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8">
              <LoadingSpinner />
            </div>
          ) : applications?.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No applications found"
                description="There are no applications to display"
              />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={applications ? applications : []}
                isLoading={isLoading}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                searchable={false}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : selectedApplication ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Certificate Number
                  </Label>
                  <p className="font-medium">
                    {selectedApplication.certificateNumber || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Certificate Type
                  </Label>
                  <p className="font-medium">
                    {selectedApplication.certificateType || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Issuing Authority
                  </Label>
                  <p className="font-medium">
                    {selectedApplication.issuingAuthority || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Issue Date</Label>
                  <p className="font-medium">
                    {selectedApplication.issueDate
                      ? formatDate(selectedApplication.issueDate)
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Expiry Date</Label>
                  <p className="font-medium">
                    {selectedApplication.expiryDate
                      ? formatDate(selectedApplication.expiryDate)
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Seafarer ID</Label>
                  <p className="font-medium font-mono text-sm">
                    {selectedApplication.seafarerId || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No details available</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
