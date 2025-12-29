"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import {
  getAccreditationDetails,
  type InstitutionAccreditationDto,
} from "@/lib/services/accreditation-service";
import {
  auditAccreditation,
  activateAccreditation,
  type AuditAccreditationRequest,
  type ActivateAccreditationRequest,
} from "@/lib/services/admin-review-service";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  Calendar,
  ArrowLeft,
  Award,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AccreditationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accreditationId = params.id as string;

  const [accreditation, setAccreditation] =
    useState<InstitutionAccreditationDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [auditData, setAuditData] = useState<AuditAccreditationRequest>({
    accreditationId: accreditationId,
    auditDate: new Date().toISOString().split("T")[0],
  });
  const [activateData, setActivateData] = useState<ActivateAccreditationRequest>({
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    certificateNumber: "",
  });

  useEffect(() => {
    if (accreditationId) {
      setAuditData({
        accreditationId: accreditationId,
        auditDate: new Date().toISOString().split("T")[0],
      });
      loadAccreditation();
    }
  }, [accreditationId]);

  const loadAccreditation = async () => {
    try {
      setIsLoading(true);
      const res = await getAccreditationDetails(accreditationId);
      const ok = res.success ?? (res as any).successful;
      if (ok && res.data) {
        setAccreditation(res.data);
      } else {
        toast.error(res.message || "Failed to load accreditation");
        router.back();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load accreditation");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudit = async () => {
    if (!accreditationId) return;
    setIsSubmitting(true);
    try {
      const res = await auditAccreditation({
        accreditationId: accreditationId,
        auditDate: auditData.auditDate || new Date().toISOString().split("T")[0],
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Accreditation audited successfully");
        setAuditDialogOpen(false);
        await loadAccreditation();
      } else {
        toast.error(res.message || "Audit failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Audit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!accreditationId) return;
    if (!activateData.issueDate || !activateData.expiryDate) {
      toast.error("Issue date and expiry date are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await activateAccreditation(accreditationId, {
        issueDate: activateData.issueDate,
        expiryDate: activateData.expiryDate,
        certificateNumber: activateData.certificateNumber || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Accreditation activated successfully");
        setActivateDialogOpen(false);
        await loadAccreditation();
      } else {
        toast.error(res.message || "Activation failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Activation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!accreditation) return null;

    if (accreditation.status?.toLowerCase() === "active" || accreditation.expiryDate) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    }
    if (accreditation.status?.toLowerCase() === "approved") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (accreditation.status?.toLowerCase() === "rejected") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-200"
      >
        <Clock className="mr-1 h-3 w-3" />
        Under Review
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!accreditation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <PageHeader
            title="Accreditation Details"
            description="View and manage accreditation application"
          />
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Accreditation Information</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Accreditation ID</Label>
              <p className="font-medium">{accreditation.id}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Institution ID</Label>
              <p className="font-medium">{accreditation.institutionId || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Accreditation Type</Label>
              <p className="font-medium">
                {accreditation.accreditationType || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Status</Label>
              <p className="font-medium">{accreditation.status || "N/A"}</p>
            </div>
            {accreditation.certificateNumber && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Certificate Number</Label>
                <p className="font-medium">{accreditation.certificateNumber}</p>
              </div>
            )}
            {accreditation.issueDate && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Issue Date</Label>
                <p className="font-medium">{formatDate(accreditation.issueDate)}</p>
              </div>
            )}
            {accreditation.expiryDate && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Expiry Date</Label>
                <p className="font-medium">{formatDate(accreditation.expiryDate)}</p>
              </div>
            )}
            {accreditation.lastAuditDate && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Last Audit Date</Label>
                <p className="font-medium">{formatDate(accreditation.lastAuditDate)}</p>
              </div>
            )}
          </div>

          {accreditation.fileUrl && (
            <div className="pt-4 border-t">
              <Label className="text-muted-foreground">Application File</Label>
              <a
                href={accreditation.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline mt-2"
              >
                <FileText className="h-4 w-4" />
                View Application File
              </a>
            </div>
          )}

          {/* Action Buttons */}
          {accreditation.status?.toLowerCase() !== "active" &&
            accreditation.status?.toLowerCase() !== "rejected" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuditData({
                      accreditationId: accreditationId,
                      auditDate: new Date().toISOString().split("T")[0],
                    });
                    setAuditDialogOpen(true);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Audit
                </Button>
                {accreditation.status?.toLowerCase() === "approved" && (
                  <Button
                    onClick={() => {
                      setActivateData({
                        issueDate: new Date().toISOString().split("T")[0],
                        expiryDate: "",
                        certificateNumber: accreditation.certificateNumber || "",
                      });
                      setActivateDialogOpen(true);
                    }}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Audit Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Accreditation</DialogTitle>
            <DialogDescription>
              Audit this accreditation application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audit Date</Label>
              <Input
                type="date"
                value={auditData.auditDate || ""}
                onChange={(e) =>
                  setAuditData({ ...auditData, auditDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAuditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAudit} loading={isSubmitting}>
              Submit Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Accreditation</DialogTitle>
            <DialogDescription>
              Activate this accreditation and set issue and expiry dates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required>Issue Date</Label>
              <Input
                type="date"
                value={activateData.issueDate || ""}
                onChange={(e) =>
                  setActivateData({
                    ...activateData,
                    issueDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Expiry Date</Label>
              <Input
                type="date"
                value={activateData.expiryDate || ""}
                onChange={(e) =>
                  setActivateData({
                    ...activateData,
                    expiryDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Certificate Number (Optional)</Label>
              <Input
                value={activateData.certificateNumber || ""}
                onChange={(e) =>
                  setActivateData({
                    ...activateData,
                    certificateNumber: e.target.value,
                  })
                }
                placeholder="Enter certificate number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleActivate} loading={isSubmitting}>
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

