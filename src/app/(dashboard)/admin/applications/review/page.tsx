"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Download, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  DataTable,
} from "@/components/shared";
import {
  getApplicationsWithHistory,
  approveApplication,
  rejectApplication,
  type ApplicationHistoryDto,
  type ApplicationAttachmentDto,
} from "@/lib/services/application-service";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export default function AdminApplicationsReviewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<ApplicationHistoryDto[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationHistoryDto | null>(null);
  const [attachments, setAttachments] = useState<ApplicationAttachmentDto[]>(
    [],
  );
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] =
    useState<ApplicationAttachmentDto | null>(null);
  const [remarks, setRemarks] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await getApplicationsWithHistory({
        pageNumber,
        pageSize,
      });
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || "Failed to load applications");

      const paginated = res.data;
      const applicationsData = paginated?.items ?? [];
      setApplications(applicationsData);
      setTotalCount(paginated?.totalCount ?? 0);
      setTotalPages(paginated?.totalPages ?? 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [pageNumber, pageSize]);

  // Note: loadAttachments is no longer used since documents are extracted
  // directly from the onboarding record in handleViewAttachments

  const handleViewAttachments = async (application: ApplicationHistoryDto) => {
    setSelectedApplication(application);
    setIsAttachmentsDialogOpen(true);

    // Extract documents from ApplicationHistoryDto (Applications/history response)
    const appData = application as any;
    const allDocuments: ApplicationAttachmentDto[] = [];

    // Documents array from Applications API (ApplicationDocumentDto[])
    if (appData.documents && Array.isArray(appData.documents)) {
      appData.documents.forEach((doc: any) => {
        allDocuments.push({
          id: doc.documentId,
          heldDocumentId: doc.documentId,
          applicationId: appData.applicationId || appData.application?.applicationId,
          documentName: doc.documentTypeDescription || "Document",
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          fileUrl: doc.filePathOrUrl,
        });
      });
    }

    // Fallback: nested application.documents or application.requirements with document refs
    const nestedApp = appData.application;
    if (allDocuments.length === 0 && nestedApp?.documents && Array.isArray(nestedApp.documents)) {
      nestedApp.documents.forEach((doc: any) => {
        allDocuments.push({
          id: doc.documentId,
          heldDocumentId: doc.documentId,
          applicationId: nestedApp.applicationId,
          documentName: doc.documentTypeDescription || "Document",
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          fileUrl: doc.filePathOrUrl,
        });
      });
    }

    setAttachments(allDocuments);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    const appId = (selectedApplication as any).applicationId;
    if (!appId) {
      toast.error("Application ID is missing");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await approveApplication(appId);
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || res.error?.message || "Failed to approve");
      toast.success("Application approved");
      setIsApproveDialogOpen(false);
      setRemarks("");
      setSelectedApplication(null);
      loadApplications();
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    const appId = (selectedApplication as any).applicationId;
    if (!appId) {
      toast.error("Application ID is missing");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await rejectApplication(appId, {
        rejectionReason: remarks.trim() || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || res.error?.message || "Failed to reject");
      toast.success("Application rejected");
      setIsRejectDialogOpen(false);
      setRemarks("");
      setSelectedApplication(null);
      loadApplications();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewDocument = async (
    attachment: ApplicationAttachmentDto,
  ) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const token = useAuthStore.getState().token;
      const fileUrl = attachment.fileUrl;

      // Use direct file URL (same as profile-documents): API_BASE + filePathOrUrl
      const directUrl = fileUrl?.startsWith("http")
        ? fileUrl
        : fileUrl
          ? `${API_BASE_URL.replace(/\/$/, "")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
          : null;

      if (!directUrl) {
        toast.error("Document URL is not available for preview");
        return;
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(directUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to load document for preview");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      setPreviewUrl(blobUrl);
      setPreviewDocument(attachment);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Failed to preview document. Please try again.");
    }
  };

  const handleDownloadDocument = async (
    attachment: ApplicationAttachmentDto,
  ) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const token = useAuthStore.getState().token;
      const fileUrl = attachment.fileUrl;

      // Use direct file URL (same as profile-documents): API_BASE + filePathOrUrl
      const directUrl = fileUrl?.startsWith("http")
        ? fileUrl
        : fileUrl
          ? `${API_BASE_URL.replace(/\/$/, "")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
          : null;

      if (!directUrl) {
        toast.error("Document URL is not available for download");
        return;
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(directUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const fileName =
        attachment.documentName || attachment.heldDocumentId || "document";
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Please try again.");
    }
  };

  const columns = [
    {
      id: "applicantId",
      header: "Applicant ID",
      cell: ({ row }: { row: ApplicationHistoryDto }) => {
        const applicantId = (row as any).rn || (row as any).application?.rn;
        return (
          <div className="font-medium font-mono text-sm">
            {applicantId || "N/A"}
          </div>
        );
      },
    },
    {
      id: "serviceName",
      header: "Service",
      cell: ({ row }: { row: ApplicationHistoryDto }) => {
        const serviceName =
          (row as any).serviceName || (row as any).application?.serviceName;
        return (
          <div className="font-mono text-sm">{serviceName || "N/A"}</div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: ApplicationHistoryDto }) => {
        const status =
          (row as any).applicationStatus ||
          (row as any).application?.applicationStatus ||
          (row as any).application?.status ||
          "Pending";
        const statusVariant = status.toLowerCase().includes("approved")
          ? "default"
          : status.toLowerCase().includes("rejected")
            ? "destructive"
            : status.toLowerCase().includes("pending")
              ? "secondary"
              : "outline";
        return <Badge variant={statusVariant}>{String(status).toUpperCase()}</Badge>;
      },
    },
    {
      id: "paymentStatus",
      header: "Payment",
      cell: ({ row }: { row: ApplicationHistoryDto }) => {
        const paymentStatus =
          (row as any).paymentStatus ??
          ((row as any).hasPayment ? "PAID" : null) ??
          ((row as any).application?.hasPayment ? "PAID" : null);
        const label = paymentStatus || "Unpaid";
        const variant =
          paymentStatus === "PAID"
            ? "default"
            : paymentStatus === "FAILED"
              ? "destructive"
              : "secondary";
        return <Badge variant={variant}>{String(label).toUpperCase()}</Badge>;
      },
    },
    {
      id: "submittedAt",
      header: "Submitted",
      cell: ({ row }: { row: ApplicationHistoryDto }) => {
        const submittedDate =
          (row as any).applicationDate ||
          (row as any).dateSubmitted ||
          (row as any).dateCreated ||
          (row as any).application?.applicationDate ||
          (row as any).application?.dateCreated;
        return (
          <div className="text-sm text-muted-foreground">
            {submittedDate
              ? new Date(submittedDate).toLocaleDateString()
              : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: ApplicationHistoryDto }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewAttachments(row)}
          >
            View Attachments
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedApplication(row);
              setIsApproveDialogOpen(true);
            }}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedApplication(row);
              setIsRejectDialogOpen(true);
            }}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications Review"
        description="Review service applications (certificates, licenses, etc.)"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Service Applications</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageNumber(1);
              }}
            >
              <SelectTrigger className="w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 && !isLoading ? (
            <EmptyState title="No service applications found" />
          ) : (
            <DataTable
              columns={columns}
              data={applications}
              getRowId={(row) =>
                (row as any).applicationId || (row as any).application?.applicationId || ""
              }
              pageSize={pageSize}
              totalCount={totalCount}
              currentPage={pageNumber}
              onPageChange={(p) => setPageNumber(Math.max(1, p))}
            />
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Add optional remarks for this approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-remarks">Remarks (Optional)</Label>
              <Textarea
                id="approve-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter approval remarks..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsApproveDialogOpen(false);
                  setRemarks("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Add remarks explaining the rejection reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-remarks">Remarks (required)</Label>
              <Textarea
                id="reject-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter rejection remarks..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRemarks("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachments Dialog */}
      <Dialog
        open={isAttachmentsDialogOpen}
        onOpenChange={setIsAttachmentsDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Attachments</DialogTitle>
            <DialogDescription>
              Documents attached to this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {attachments.length === 0 ? (
              <EmptyState title="No attachments found" />
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {attachment.documentName ||
                          attachment.heldDocumentId ||
                          "Document"}
                      </div>
                      {attachment.documentNumber && (
                        <div className="text-sm text-muted-foreground">
                          Number: {attachment.documentNumber}
                        </div>
                      )}
                      {attachment.issueDate && (
                        <div className="text-sm text-muted-foreground">
                          Issue Date:{" "}
                          {new Date(attachment.issueDate).toLocaleDateString()}
                        </div>
                      )}
                      {attachment.expiryDate && (
                        <div className="text-sm text-muted-foreground">
                          Expiry Date:{" "}
                          {new Date(attachment.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                      {typeof attachment.wasValidAtSubmission === "boolean" && (
                        <Badge
                          variant={
                            attachment.wasValidAtSubmission
                              ? "default"
                              : "destructive"
                          }
                        >
                          {attachment.wasValidAtSubmission
                            ? "Valid"
                            : "Invalid"}{" "}
                          at submission
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(attachment.heldDocumentId || attachment.fileUrl) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewDocument(attachment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(attachment)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.documentName ||
                previewDocument?.heldDocumentId ||
                "Document Preview"}
            </DialogTitle>
            <DialogDescription>
              Preview of the attached document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative w-full h-[70vh] border rounded-lg overflow-hidden">
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Document Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[70vh] border rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Unable to preview this document
                  </p>
                  {previewDocument && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => handleDownloadDocument(previewDocument)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewModalOpen(false);
                if (previewUrl) {
                  window.URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                setPreviewDocument(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {previewDocument && (
              <Button onClick={() => handleDownloadDocument(previewDocument)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
