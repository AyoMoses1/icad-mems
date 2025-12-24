"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getAccreditationRequirements,
  checkAccreditationStatus,
  applyForAccreditation,
  uploadAccreditationEvidence,
  finalizeAccreditation,
  generateAccreditationInvoice,
  getAccreditationInvoice,
  verifyAccreditationPayment,
  type AccreditationRequirement,
  type AccreditationApplyResponse,
} from "@/lib/services/accreditation-service";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import {
  getInstitutions,
  type InstitutionDto,
} from "@/lib/services/institutions";

export default function AccreditationApplyPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<AccreditationRequirement[]>(
    [],
  );
  const [accreditationId, setAccreditationId] =
    useState<AccreditationApplyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [form, setForm] = useState({
    institutionId: "",
    accreditationType: "",
    evidenceFiles: [] as File[],
    paymentReference: "",
  });

  useEffect(() => {
    loadRequirements();
    loadInstitutions();
  }, []);

  const loadRequirements = async () => {
    try {
      const res = await getAccreditationRequirements();
      if (res.success && res.data?.requirements) {
        setRequirements(res.data.requirements);
      }
      // optional: status check
      await checkAccreditationStatus(form.institutionId);
    } catch (e) {
      toast.error("Failed to load requirements");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInstitutions = async () => {
    setIsLoadingInstitutions(true);
    try {
      const res = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      setInstitutions(res.items || []);
    } catch (e) {
      console.error("Failed to load institutions", e);
      toast.error("Failed to load institutions");
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  const handleApply = async () => {
    if (!form.institutionId || !form.accreditationType) {
      toast.error("Institution and accreditation type are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await applyForAccreditation({
        institutionId: form.institutionId,
        accreditationType: form.accreditationType,
      });
      if (res.success && res.data) {
        setAccreditationId(res.data);
        toast.success("Application created. Upload evidence next.");
      } else {
        toast.error(res.message || "Failed to create application");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!accreditationId?.accreditationId || form.evidenceFiles.length === 0) {
      toast.error("No evidence selected");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await uploadAccreditationEvidence(
        accreditationId.accreditationId,
        form.evidenceFiles,
      );
      if (res.success) {
        toast.success("Evidence uploaded");
      } else {
        toast.error(res.message || "Upload failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    if (!accreditationId?.accreditationId) return;
    setIsSubmitting(true);
    try {
      const res = await finalizeAccreditation(accreditationId.accreditationId);
      if (res.success) {
        toast.success("Application finalized");
      } else {
        toast.error(res.message || "Finalize failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Finalize failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoice = async () => {
    if (!accreditationId?.accreditationId) return;
    setIsSubmitting(true);
    try {
      const res = await generateAccreditationInvoice(
        accreditationId.accreditationId,
      );
      if (res.success) {
        const invoice = await getAccreditationInvoice(
          accreditationId.accreditationId,
        );
        if (invoice.success && invoice.data?.paymentUrl) {
          window.open(invoice.data.paymentUrl, "_blank");
        }
        toast.success("Invoice generated");
      } else {
        toast.error(res.message || "Invoice generation failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Invoice generation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!accreditationId?.accreditationId || !form.paymentReference) {
      toast.error("Payment reference required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await verifyAccreditationPayment(
        accreditationId.accreditationId,
        { paymentReference: form.paymentReference },
      );
      if (res.success && res.data?.isVerified) {
        toast.success("Payment verified");
        router.push("/accreditations");
      } else {
        toast.error(res.message || "Payment not verified");
      }
    } catch (e: any) {
      toast.error(e.message || "Verify failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Accreditation"
        description="Submit accreditation application and track status"
      />

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institution ID</Label>
              <Select
                value={form.institutionId}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, institutionId: value }))
                }
                disabled={isLoadingInstitutions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name || inst.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Accreditation Type</Label>
              <Select
                value={form.accreditationType}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, accreditationType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accreditation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QSS_Certification">
                    QSS Certification
                  </SelectItem>
                  <SelectItem value="Medical_Facility_Approval">
                    Medical Facility Approval
                  </SelectItem>
                  <SelectItem value="Provisional_MTI">
                    Provisional MTI
                  </SelectItem>
                  <SelectItem value="Full_MTI_License">
                    Full MTI License
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleApply} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{req.name}</p>
                {req.description && (
                  <p className="text-sm text-muted-foreground">
                    {req.description}
                  </p>
                )}
              </div>
              {req.isRequired && <Badge variant="destructive">Required</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            multiple
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                evidenceFiles: Array.from(e.target.files || []),
              }))
            }
          />
          <Button onClick={handleUploadEvidence} disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Evidence"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finalize & Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleFinalize}
              disabled={isSubmitting}
            >
              Finalize Application
            </Button>
            <Button
              variant="outline"
              onClick={handleInvoice}
              disabled={isSubmitting}
            >
              Generate Invoice
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Payment Reference</Label>
            <Input
              value={form.paymentReference}
              onChange={(e) =>
                setForm((p) => ({ ...p, paymentReference: e.target.value }))
              }
              placeholder="Payment reference"
            />
            <Button onClick={handleVerifyPayment} disabled={isSubmitting}>
              Verify Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
