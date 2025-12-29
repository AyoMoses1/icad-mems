"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  getAccreditationDetails,
  type AccreditationRequirement,
  type InstitutionAccreditationDto,
} from "@/lib/services/accreditation-service";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import {
  getInstitutions,
  type InstitutionDto,
} from "@/lib/services/institutions";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";

type Step = "requirements" | "apply" | "upload" | "finalize" | "payment";

export default function AccreditationApplyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("requirements");
  const [requirements, setRequirements] = useState<AccreditationRequirement[]>(
    [],
  );
  const [accreditation, setAccreditation] =
    useState<InstitutionAccreditationDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  const [form, setForm] = useState({
    accreditationType: "",
    applicationFile: null as File | null,
    evidenceFiles: [] as File[],
    remarks: "",
    paymentReference: "",
    invoiceData: {
      totalAmount: 0,
      currency: "NGN",
      dueDate: "",
      billingCategory: "",
    },
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  // Load requirements when institution is selected
  useEffect(() => {
    if (selectedInstitution && user?.id && institutions.length > 0) {
      loadRequirements();
    } else {
      setRequirements([]);
    }
  }, [selectedInstitution, user?.id, institutions]);

  const loadRequirements = async () => {
    if (!selectedInstitution || !user?.id) {
      toast.error("Please select an institution first");
      return;
    }

    // Find the selected institution to get its institutionType
    const selectedInstitutionObj = institutions.find(
      (inst) => inst.id === selectedInstitution,
    );

    if (!selectedInstitutionObj) {
      toast.error("Selected institution not found");
      return;
    }

    // Use institutionType as userType for requirements
    const userType = selectedInstitutionObj.institutionType;

    try {
      setIsLoading(true);
      const res = await getAccreditationRequirements({
        authUserId: user.id,
        institutionId: selectedInstitution,
        userType: userType || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok && res.data) {
        const reqs = Array.isArray(res.data) ? res.data : [];
        setRequirements(reqs);
      } else {
        toast.error(res.message || "Failed to load requirements");
      }
    } catch (e) {
      console.error("Failed to load requirements", e);
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
      // const ok = res.success ?? (res as any).successful;
      // if (ok && res.data) {
      // }
      setInstitutions(
        Array.isArray(res.items) ? res.items : (res.items as any) || [],
      );
    } catch (e) {
      console.error("Failed to load institutions", e);
      toast.error("Failed to load institutions");
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!selectedInstitution) {
      toast.error("Please select an institution first");
      return;
    }

    // Find the selected institution to get its institutionType
    const selectedInstitutionObj = institutions.find(
      (inst) => inst.id === selectedInstitution,
    );

    if (!selectedInstitutionObj) {
      toast.error("Selected institution not found");
      return;
    }

    // Use institutionType as userType for status check
    const userType = selectedInstitutionObj.institutionType;

    try {
      setIsSubmitting(true);
      const res = await checkAccreditationStatus({
        institutionId: selectedInstitution,
        userType: userType || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok && res.data) {
        setGapAnalysis(res.data);
        if (res.data.isEligible) {
          toast.success("Institution is eligible for accreditation");
          setCurrentStep("apply");
        } else {
          toast.warning(
            res.data.message || "Institution has missing requirements",
          );
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to check status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async () => {
    if (!form.accreditationType || !form.applicationFile) {
      toast.error("Accreditation type and application file are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await applyForAccreditation(
        form.accreditationType,
        form.applicationFile,
      );
      const ok = res.success ?? (res as any).successful;
      if (ok && res.data) {
        setAccreditation(res.data);
        toast.success("Application submitted successfully");
        setCurrentStep("upload");
      } else {
        toast.error(res.message || "Failed to submit application");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadEvidence = async (file: File) => {
    if (!accreditation?.id) {
      toast.error("No accreditation application found");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await uploadAccreditationEvidence(accreditation.id, file);
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Evidence uploaded successfully");
        // Reload accreditation details
        const detailsRes = await getAccreditationDetails(accreditation.id);
        if (detailsRes.success && detailsRes.data) {
          setAccreditation(detailsRes.data);
        }
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
    if (!accreditation?.id) return;
    setIsSubmitting(true);
    try {
      const res = await finalizeAccreditation(accreditation.id, {
        remarks: form.remarks || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Application finalized successfully");
        setCurrentStep("payment");
      } else {
        toast.error(res.message || "Finalization failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Finalization failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!accreditation?.id) return;
    if (!form.invoiceData.totalAmount || !form.invoiceData.dueDate) {
      toast.error("Total amount and due date are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await generateAccreditationInvoice(accreditation.id, {
        totalAmount: form.invoiceData.totalAmount,
        currency: form.invoiceData.currency,
        dueDate: form.invoiceData.dueDate,
        billingCategory: form.invoiceData.billingCategory || undefined,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok) {
        toast.success("Invoice generated successfully");
        // Get invoice details
        const invoiceRes = await getAccreditationInvoice(accreditation.id);
        if (invoiceRes.success && invoiceRes.data?.paymentUrl) {
          window.open(invoiceRes.data.paymentUrl, "_blank");
        }
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
    if (!accreditation?.id || !form.paymentReference) {
      toast.error("Payment reference is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await verifyAccreditationPayment(accreditation.id, {
        paymentReference: form.paymentReference,
      });
      const ok = res.success ?? (res as any).successful;
      if (ok && res.data?.isVerified) {
        toast.success("Payment verified successfully");
        router.push("/accreditations");
      } else {
        toast.error(res.data?.message || "Payment verification failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Accreditation"
        description="Submit accreditation application and track status"
      />

      {/* Requirements Step */}
      {currentStep === "requirements" && (
        <Card>
          <CardHeader>
            <CardTitle>Accreditation Requirements</CardTitle>
            <CardDescription>
              Review the requirements before applying
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label required>Select Institution</Label>
              <Select
                value={selectedInstitution}
                onValueChange={(value) => {
                  setSelectedInstitution(value);
                  setRequirements([]); // Clear requirements when institution changes
                }}
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
              {!selectedInstitution && (
                <p className="text-sm text-muted-foreground">
                  Please select an institution to view requirements
                </p>
              )}
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading requirements...
                </span>
              </div>
            )}

            {!selectedInstitution && (
              <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
                <p>
                  Please select an institution to view accreditation
                  requirements
                </p>
              </div>
            )}

            {selectedInstitution && requirements.length === 0 && !isLoading && (
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  No requirements found for this institution. Click the button
                  below to check eligibility status.
                </p>
              </div>
            )}

            {/* <Button
              onClick={handleCheckStatus}
              disabled={!selectedInstitution || isSubmitting}
              loading={isSubmitting}
            >
              Check Eligibility Status
            </Button> */}

            {gapAnalysis && (
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {gapAnalysis.isEligible ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">
                        Eligible for Accreditation
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-600">
                        Missing Requirements
                      </span>
                    </>
                  )}
                </div>
                {gapAnalysis.missingRequirements &&
                  gapAnalysis.missingRequirements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Missing:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {gapAnalysis.missingRequirements.map(
                          (req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            <div className="space-y-3">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{req.name}</p>
                    {req.categoryType && (
                      <p className="text-sm text-muted-foreground">
                        Category: {req.categoryType}
                      </p>
                    )}
                  </div>
                  {req.isMandatory && (
                    <Badge variant="destructive">Required</Badge>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setCurrentStep("apply")}
              className="w-full"
              disabled={!selectedInstitution}
            >
              Continue to Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Apply Step */}
      {currentStep === "apply" && (
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Submit your accreditation application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label required>Accreditation Type</Label>
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

            <div className="space-y-2">
              <Label required>Application File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm((p) => ({ ...p, applicationFile: file }));
                  }
                }}
              />
              {form.applicationFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {form.applicationFile.name} (
                  {(form.applicationFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("requirements")}
              >
                Back
              </Button>
              <Button onClick={handleApply} loading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Evidence Step */}
      {currentStep === "upload" && accreditation && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Evidence</CardTitle>
            <CardDescription>
              Upload supporting documents for your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Evidence File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleUploadEvidence(file);
                  }
                }}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("apply")}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("finalize")}
                disabled={!accreditation.fileUrl}
              >
                Continue to Finalize
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finalize Step */}
      {currentStep === "finalize" && accreditation && (
        <Card>
          <CardHeader>
            <CardTitle>Finalize Application</CardTitle>
            <CardDescription>
              Review and finalize your accreditation application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Remarks (Optional)</Label>
              <Textarea
                value={form.remarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remarks: e.target.value }))
                }
                placeholder="Add any additional remarks..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("upload")}
              >
                Back
              </Button>
              <Button onClick={handleFinalize} loading={isSubmitting}>
                Finalize Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && accreditation && (
        <Card>
          <CardHeader>
            <CardTitle>Payment & Verification</CardTitle>
            <CardDescription>
              Generate invoice and verify payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label required>Total Amount</Label>
                <Input
                  type="number"
                  value={form.invoiceData.totalAmount || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      invoiceData: {
                        ...p.invoiceData,
                        totalAmount: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label required>Due Date</Label>
                <Input
                  type="date"
                  value={form.invoiceData.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      invoiceData: {
                        ...p.invoiceData,
                        dueDate: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.invoiceData.currency}
                  onValueChange={(value) =>
                    setForm((p) => ({
                      ...p,
                      invoiceData: { ...p.invoiceData, currency: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Category</Label>
                <Input
                  value={form.invoiceData.billingCategory}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      invoiceData: {
                        ...p.invoiceData,
                        billingCategory: e.target.value,
                      },
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateInvoice}
              loading={isSubmitting}
              className="w-full"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>

            <div className="space-y-2 pt-4 border-t">
              <Label required>Payment Reference</Label>
              <Input
                value={form.paymentReference}
                onChange={(e) =>
                  setForm((p) => ({ ...p, paymentReference: e.target.value }))
                }
                placeholder="Enter payment reference"
              />
              <Button
                onClick={handleVerifyPayment}
                loading={isSubmitting}
                className="w-full"
              >
                Verify Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
