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
  getPendingApplications,
  approveApplication,
  rejectApplication,
  type ApplicationDto,
  type ApplicationAttachmentDto,
} from "@/lib/services/admin-review-service";
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
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDto | null>(null);
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

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await getPendingApplications({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || "Failed to load applications");

      // Response structure: data is a direct array
      const applicationsData = Array.isArray(res.data) ? res.data : [];
      setApplications(applicationsData);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Note: loadAttachments is no longer used since documents are extracted
  // directly from the onboarding record in handleViewAttachments

  const handleViewAttachments = async (application: ApplicationDto) => {
    setSelectedApplication(application);
    setIsAttachmentsDialogOpen(true);
    
    // Extract documents from the onboarding record directly
    // The onboarding response includes all documents in various arrays
    const onboardingData = application as any;
    const allDocuments: ApplicationAttachmentDto[] = [];
    
    // Extract institution documents
    if (onboardingData.institutionDocuments && Array.isArray(onboardingData.institutionDocuments)) {
      onboardingData.institutionDocuments.forEach((doc: any) => {
        allDocuments.push({
          id: doc.documentId,
          applicationId: onboardingData.userSeafarerOnboardingId || onboardingData.id,
          documentName: doc.documentTypeDescription || "Institution Document",
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          fileUrl: doc.filePathOrUrl,
        });
      });
    }
    
    // Extract profile documents
    if (onboardingData.profileDocuments && Array.isArray(onboardingData.profileDocuments)) {
      onboardingData.profileDocuments.forEach((doc: any) => {
        allDocuments.push({
          id: doc.documentId,
          applicationId: onboardingData.userSeafarerOnboardingId || onboardingData.id,
          documentName: doc.documentTypeDescription || "Profile Document",
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          fileUrl: doc.filePathOrUrl,
        });
      });
    }
    
    // Extract education documents
    if (onboardingData.educationDetails && Array.isArray(onboardingData.educationDetails)) {
      onboardingData.educationDetails.forEach((edu: any) => {
        if (edu.documents && Array.isArray(edu.documents)) {
          edu.documents.forEach((doc: any) => {
            allDocuments.push({
              id: doc.documentId,
              applicationId: onboardingData.userSeafarerOnboardingId || onboardingData.id,
              documentName: doc.documentTypeDescription || "Education Document",
              documentNumber: doc.documentNumber,
              issueDate: doc.issueDate,
              expiryDate: doc.expiryDate,
              fileUrl: doc.filePathOrUrl,
            });
          });
        }
      });
    }
    
    // Extract voyage documents
    if (onboardingData.voyageActivities && Array.isArray(onboardingData.voyageActivities)) {
      onboardingData.voyageActivities.forEach((voyage: any) => {
        if (voyage.documents && Array.isArray(voyage.documents)) {
          voyage.documents.forEach((doc: any) => {
            allDocuments.push({
              id: doc.documentId,
              applicationId: onboardingData.userSeafarerOnboardingId || onboardingData.id,
              documentName: doc.documentTypeDescription || "Voyage Document",
              documentNumber: doc.documentNumber,
              issueDate: doc.issueDate,
              expiryDate: doc.expiryDate,
              fileUrl: doc.filePathOrUrl,
            });
          });
        }
      });
    }
    
    setAttachments(allDocuments);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    setIsSubmitting(true);
    try {
      // Use userSeafarerOnboardingId if available, otherwise fall back to id
      const applicationId = (selectedApplication as any).userSeafarerOnboardingId || selectedApplication.id;
      if (!applicationId) {
        toast.error("Application ID not found");
        setIsSubmitting(false);
        return;
      }
      
      const res = await approveApplication(applicationId, {
        remarks: remarks || null,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Application approved");
        setIsApproveDialogOpen(false);
        setRemarks("");
        setSelectedApplication(null);
        await loadApplications();
      } else {
        toast.error(res.message || "Approval failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Approval failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    setIsSubmitting(true);
    try {
      // Use userSeafarerOnboardingId if available, otherwise fall back to id
      const applicationId = (selectedApplication as any).userSeafarerOnboardingId || selectedApplication.id;
      if (!applicationId) {
        toast.error("Application ID not found");
        setIsSubmitting(false);
        return;
      }
      
      const res = await rejectApplication(applicationId, {
        remarks: remarks || null,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Application rejected");
        setIsRejectDialogOpen(false);
        setRemarks("");
        setSelectedApplication(null);
        await loadApplications();
      } else {
        toast.error(res.message || "Rejection failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Rejection failed");
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

      // Build query parameters for /api/files/download
      const queryParams = new URLSearchParams();
      if (attachment.heldDocumentId) {
        queryParams.append("id", attachment.heldDocumentId);
      }
      if (attachment.fileUrl) {
        queryParams.append("url", attachment.fileUrl);
      }

      if (!attachment.heldDocumentId && !attachment.fileUrl) {
        toast.error("Document ID or URL is required for preview");
        return;
      }

      const url = `${API_BASE_URL}/api/files/download?${queryParams.toString()}`;

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
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

      // Build query parameters for /api/files/download
      const queryParams = new URLSearchParams();
      if (attachment.heldDocumentId) {
        queryParams.append("id", attachment.heldDocumentId);
      }
      if (attachment.fileUrl) {
        queryParams.append("url", attachment.fileUrl);
      }

      if (!attachment.heldDocumentId && !attachment.fileUrl) {
        toast.error("Document ID or URL is required for download");
        return;
      }

      const url = `${API_BASE_URL}/api/files/download?${queryParams.toString()}`;

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
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
      cell: ({ row }: { row: ApplicationDto }) => {
        // Use rn (reference number) as Applicant ID, fallback to other fields
        const applicantId = (row as any).rn || row.applicantId || row.seafarerId || row.seafarerName;
        return (
          <div className="font-medium font-mono text-sm">
            {applicantId || "N/A"}
          </div>
        );
      },
    },
    {
      id: "targetDocument",
      header: "Target Document",
      cell: ({ row }: { row: ApplicationDto }) => {
        // Use roleDescription or role as Target Document
        const targetDoc = (row as any).roleDescription || (row as any).role || 
                         row.targetDocumentMasterId ||
                         row.certificateId ||
                         row.documentId ||
                         row.certificateName ||
                         row.documentName;
        return (
          <div className="font-mono text-sm">
            {targetDoc || "N/A"}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: ApplicationDto }) => {
        // Use status or statusDescription from onboarding, fallback to applicationStatus
        const status = (row as any).status || 
                      (row as any).statusDescription || 
                      row.applicationStatus || 
                      "Pending";
        const statusVariant = status.toLowerCase().includes("approved")
          ? "default"
          : status.toLowerCase().includes("rejected")
            ? "destructive"
            : status.toLowerCase().includes("pending")
              ? "secondary"
              : "outline";
        return <Badge variant={statusVariant}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      id: "paymentStatus",
      header: "Payment",
      cell: ({ row }: { row: ApplicationDto }) => (
        <Badge variant={row.isPaid ? "default" : "secondary"}>
          {row.isPaid ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
    {
      id: "submittedAt",
      header: "Submitted",
      cell: ({ row }: { row: ApplicationDto }) => {
        // Use dateCreated from onboarding, fallback to other date fields
        const submittedDate = (row as any).dateCreated || 
                             row.submissionDate ||
                             row.submittedAt ||
                             row.createdAt;
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
      cell: ({ row }: { row: ApplicationDto }) => (
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
        description="Review and approve/reject certificate applications"
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <EmptyState title="No pending applications" />
          ) : (
            <DataTable columns={columns} data={applications} />
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
              <Label htmlFor="reject-remarks">Remarks (Optional)</Label>
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
                      {attachment.wasValidAtSubmission !== null && (
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
