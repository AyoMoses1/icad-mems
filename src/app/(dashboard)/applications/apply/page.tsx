"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useAuthStore } from "@/store";
import {
  checkEligibilityForCurrentUser,
  createDraftApplication,
  attachDocumentsToApplication,
  generateApplicationInvoiceWithFee,
  getApplicationInvoice,
  type ApplicationDto as ApplicationServiceDto,
  type EligibilityResultDto,
  type ApplicationInvoiceDto,
} from "@/lib/services/application-service";
import {
  getCertificates,
  getCertificateById,
  getCertificateFees,
  type CertificateDto,
  type CertificateFeeDto,
} from "@/lib/services/certificates-service";
import {
  getMySeafarerDocuments,
  getMySeafarer,
  type SeafarerHeldDocumentDto,
} from "@/lib/services/seafarers";
import { simulatePayment } from "@/lib/services/payment-service";
import { formatDate } from "@/lib/utils";

type Step =
  | "select"
  | "eligibility"
  | "create"
  | "attach"
  | "invoice"
  | "complete";

export default function ApplyApplicationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Select Certificate/Document
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] =
    useState<string>("");
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateDto | null>(null);

  // Step 2: Eligibility Check
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResultDto | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  // Step 3: Create Application
  const [remarks, setRemarks] = useState("");
  const [application, setApplication] = useState<ApplicationServiceDto | null>(
    null,
  );
  const [seafarerId, setSeafarerId] = useState<string>("");

  // Step 4: Attach Documents
  const [heldDocuments, setHeldDocuments] = useState<SeafarerHeldDocumentDto[]>(
    [],
  );
  const [selectedAttachments, setSelectedAttachments] = useState<
    Map<string, boolean>
  >(new Map());

  // Step 5: Invoice
  const [invoice, setInvoice] = useState<ApplicationInvoiceDto | null>(null);
  const [certificateFees, setCertificateFees] = useState<any[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    certificateFeeId: "",
    nationalityType: "",
    processingSpeed: "",
    billingCategory: "",
    dueDate: "",
  });

  useEffect(() => {
    loadCertificates();
    loadSeafarerId();
  }, []);

  useEffect(() => {
    if (selectedCertificateId) {
      loadCertificateDetails(selectedCertificateId);
    }
  }, [selectedCertificateId]);

  useEffect(() => {
    if (currentStep === "attach" && application?.id) {
      loadHeldDocuments();
    }
  }, [currentStep, application?.id]);

  useEffect(() => {
    if (selectedCertificate && currentStep === "invoice") {
      loadCertificateFeesForInvoice();
    }
  }, [selectedCertificate, currentStep]);

  const loadSeafarerId = async () => {
    try {
      const response = await getMySeafarer();
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data?.id) {
        setSeafarerId(response.data.id);
      }
    } catch (error: any) {
      console.error("Error loading seafarer ID:", error);
    }
  };

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await getCertificates({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        const items = response.data.items || [];
        setCertificates(items);
      } else {
        toast.error(response.message || "Failed to load certificates");
      }
    } catch (error: any) {
      console.error("Error loading certificates:", error);
      toast.error(error.message || "Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCertificateDetails = async (certificateId: string) => {
    try {
      const response = await getCertificateById(certificateId);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSelectedCertificate(response.data);
      }
    } catch (error: any) {
      console.error("Error loading certificate details:", error);
    }
  };

  const loadCertificateFeesForInvoice = async () => {
    if (!selectedCertificate?.id) return;

    // First check if fees are already in the certificate object
    if (selectedCertificate.fees && selectedCertificate.fees.length > 0) {
      setCertificateFees(selectedCertificate.fees);
      return;
    }

    // Otherwise, fetch them separately
    try {
      const response = await getCertificateFees(selectedCertificate.id);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setCertificateFees(response.data || []);
      }
    } catch (error: any) {
      console.error("Error loading certificate fees:", error);
    }
  };

  const loadHeldDocuments = async () => {
    try {
      const response = await getMySeafarerDocuments();
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        const items = Array.isArray(response.data) ? response.data : [];
        setHeldDocuments(items);
      }
    } catch (error: any) {
      console.error("Error loading held documents:", error);
      toast.error(error.message || "Failed to load your documents");
    }
  };

  const handleCheckEligibility = async () => {
    if (!selectedCertificateId) {
      toast.error("Please select a certificate");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await checkEligibilityForCurrentUser({
        targetDocumentMasterId: selectedCertificateId,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setEligibilityResult(response.data);
        setIsEligible(response.data.isEligible ?? false);
        setCurrentStep("eligibility");
        if (response.data.isEligible) {
          toast.success("You are eligible to apply for this certificate");
        } else {
          toast.warning(
            "You may not be eligible for this certificate. Please review the requirements.",
          );
        }
      } else {
        toast.error(response.message || "Failed to check eligibility");
      }
    } catch (error: any) {
      console.error("Error checking eligibility:", error);
      toast.error(error.message || "Failed to check eligibility");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateApplication = async () => {
    if (!selectedCertificateId) {
      toast.error("Please select a certificate");
      return;
    }

    if (!seafarerId) {
      toast.error("Unable to get seafarer information. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createDraftApplication({
        applicantId: seafarerId,
        targetDocumentMasterId: selectedCertificateId,
        remarks: remarks.trim() || undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setApplication(response.data as unknown as ApplicationServiceDto);
        setCurrentStep("attach");
        toast.success("Application created successfully");
      } else {
        toast.error(response.message || "Failed to create application");
      }
    } catch (error: any) {
      console.error("Error creating application:", error);
      toast.error(error.message || "Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachDocuments = async () => {
    if (!application?.id) {
      toast.error("Application not found");
      return;
    }

    const attachments = Array.from(selectedAttachments.entries())
      .filter(([_, selected]) => selected)
      .map(([heldDocumentId]) => ({
        heldDocumentId,
        wasValidAtSubmission: true,
      }));

    if (attachments.length === 0) {
      toast.error("Please select at least one document to attach");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await attachDocumentsToApplication(
        application.id,
        attachments,
      );

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setCurrentStep("invoice");
        toast.success("Documents attached successfully");
      } else {
        toast.error(response.message || "Failed to attach documents");
      }
    } catch (error: any) {
      console.error("Error attaching documents:", error);
      toast.error(error.message || "Failed to attach documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!application?.id) {
      toast.error("Application not found");
      return;
    }

    if (!invoiceFormData.certificateFeeId || !invoiceFormData.dueDate) {
      toast.error("Please fill in all required invoice fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await generateApplicationInvoiceWithFee(application.id, {
        certificateFeeId: invoiceFormData.certificateFeeId,
        nationalityType: invoiceFormData.nationalityType || undefined,
        processingSpeed: invoiceFormData.processingSpeed || undefined,
        billingCategory: invoiceFormData.billingCategory || undefined,
        dueDate: invoiceFormData.dueDate,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setInvoice(response.data);
        setCurrentStep("complete");
        toast.success("Invoice generated successfully");
      } else {
        toast.error(response.message || "Failed to generate invoice");
      }
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      toast.error(error.message || "Failed to generate invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadInvoice = async () => {
    if (!application?.id) {
      return;
    }

    try {
      const response = await getApplicationInvoice(application.id);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setInvoice(response.data);
        setCurrentStep("complete");
      }
    } catch (error: any) {
      console.error("Error loading invoice:", error);
    }
  };

  const handlePayInvoice = async () => {
    if (!invoice?.id) {
      toast.error("Invoice not found");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus("pending");

    try {
      const response = await simulatePayment({
        invoiceId: invoice.id,
        paymentReference: `PAY-${Date.now()}`,
        rrrNumber: null,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        setPaymentStatus("success");
        toast.success("Payment processed successfully!");
        // Reload invoice to get updated status
        if (application?.id) {
          await handleLoadInvoice();
        }
      } else {
        setPaymentStatus("failed");
        toast.error(response.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      setPaymentStatus("failed");
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStepProgress = () => {
    const steps = [
      "select",
      "eligibility",
      "create",
      "attach",
      "invoice",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Certificate"
        description="Complete your certificate application step by step"
      />

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step{" "}
                {currentStep === "select"
                  ? 1
                  : currentStep === "eligibility"
                    ? 2
                    : currentStep === "create"
                      ? 3
                      : currentStep === "attach"
                        ? 4
                        : currentStep === "invoice"
                          ? 5
                          : 6}{" "}
                of 6
              </span>
              <span>{Math.round(getStepProgress())}%</span>
            </div>
            <Progress value={getStepProgress()} />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Certificate/Document */}
      {currentStep === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Certificate/Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificate">Certificate *</Label>
              <Select
                value={selectedCertificateId}
                onValueChange={setSelectedCertificateId}
              >
                <SelectTrigger id="certificate">
                  <SelectValue placeholder="Select a certificate" />
                </SelectTrigger>
                <SelectContent>
                  {certificates.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name || cert.id}
                      {cert.stcwCode && ` (${cert.stcwCode})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCertificate && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">{selectedCertificate.name}</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedCertificate.categoryType && (
                    <Badge variant="outline">
                      {selectedCertificate.categoryType}
                    </Badge>
                  )}
                  {selectedCertificate.certType && (
                    <Badge variant="outline">
                      {selectedCertificate.certType}
                    </Badge>
                  )}
                  {selectedCertificate.rankLevel && (
                    <Badge variant="outline">
                      Rank: {selectedCertificate.rankLevel}
                    </Badge>
                  )}
                </div>
                {selectedCertificate.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCertificate.description}
                  </p>
                )}
                {selectedCertificate.stcwCode && (
                  <p className="text-sm text-muted-foreground">
                    <strong>STCW Code:</strong> {selectedCertificate.stcwCode}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleCheckEligibility}
                disabled={!selectedCertificateId || isSubmitting}
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Eligibility
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Eligibility Result */}
      {currentStep === "eligibility" && eligibilityResult && (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {isEligible ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-green-700">
                      You are eligible!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You meet all the requirements for this certificate.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-700">Not eligible</h3>
                    <p className="text-sm text-muted-foreground">
                      You do not meet the requirements for this certificate.
                    </p>
                  </div>
                </>
              )}
            </div>

            {eligibilityResult.requirements &&
              eligibilityResult.requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {eligibilityResult.requirements.map((req, index) => (
                      <li key={index}>
                        {req.isMandatory && (
                          <Badge variant="destructive" className="mr-2">
                            Required
                          </Badge>
                        )}
                        Requirement {index + 1}
                        {req.requiredDocumentMasterId &&
                          ` (Document ID: ${req.requiredDocumentMasterId.slice(0, 8)}...)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("select")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {isEligible && (
                <Button
                  onClick={() => setCurrentStep("create")}
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Create Application */}
      {currentStep === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional remarks or notes..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("select")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleCreateApplication}
                disabled={isSubmitting}
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Attach Documents */}
      {currentStep === "attach" && (
        <Card>
          <CardHeader>
            <CardTitle>Attach Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {heldDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents available. Please upload documents first.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/profile-documents")}
                >
                  Go to Documents
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {heldDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedAttachments.get(doc.id || "") || false
                          }
                          onChange={(e) => {
                            const newMap = new Map(selectedAttachments);
                            if (e.target.checked) {
                              newMap.set(doc.id || "", true);
                            } else {
                              newMap.delete(doc.id || "");
                            }
                            setSelectedAttachments(newMap);
                          }}
                          className="h-4 w-4"
                        />
                        <div>
                          <p className="font-medium">
                            {doc.documentMasterId || "Document"}
                          </p>
                          {doc.documentNumber && (
                            <p className="text-sm text-muted-foreground">
                              Number: {doc.documentNumber}
                            </p>
                          )}
                          {doc.issueDate && (
                            <p className="text-sm text-muted-foreground">
                              Issued: {formatDate(doc.issueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("create")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleAttachDocuments}
                    disabled={isSubmitting || selectedAttachments.size === 0}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Attaching...
                      </>
                    ) : (
                      <>
                        Attach Documents
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Generate Invoice */}
      {currentStep === "invoice" && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="certificateFeeId">Certificate Fee *</Label>
                <Select
                  value={invoiceFormData.certificateFeeId}
                  onValueChange={(value) =>
                    setInvoiceFormData({
                      ...invoiceFormData,
                      certificateFeeId: value,
                    })
                  }
                >
                  <SelectTrigger id="certificateFeeId">
                    <SelectValue placeholder="Select fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateFees.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No fees available
                      </div>
                    ) : (
                      certificateFees
                        .filter((fee) => fee.id) // Filter out fees without IDs
                        .map((fee) => (
                          <SelectItem key={fee.id} value={fee.id!}>
                            {fee.currency || "NGN"}{" "}
                            {fee.amount?.toLocaleString() || "0"}
                            {fee.nationalityType && ` - ${fee.nationalityType}`}
                            {fee.processingSpeed && ` (${fee.processingSpeed})`}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceFormData.dueDate}
                  onChange={(e) =>
                    setInvoiceFormData({
                      ...invoiceFormData,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalityType">Nationality Type</Label>
                <Input
                  id="nationalityType"
                  value={invoiceFormData.nationalityType}
                  onChange={(e) =>
                    setInvoiceFormData({
                      ...invoiceFormData,
                      nationalityType: e.target.value,
                    })
                  }
                  placeholder="e.g., Local, Foreign"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingSpeed">Processing Speed</Label>
                <Input
                  id="processingSpeed"
                  value={invoiceFormData.processingSpeed}
                  onChange={(e) =>
                    setInvoiceFormData({
                      ...invoiceFormData,
                      processingSpeed: e.target.value,
                    })
                  }
                  placeholder="e.g., Standard, Express"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billingCategory">Billing Category</Label>
                <Input
                  id="billingCategory"
                  value={invoiceFormData.billingCategory}
                  onChange={(e) =>
                    setInvoiceFormData({
                      ...invoiceFormData,
                      billingCategory: e.target.value,
                    })
                  }
                  placeholder="Billing category"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("attach")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleGenerateInvoice}
                disabled={
                  isSubmitting ||
                  !invoiceFormData.certificateFeeId ||
                  !invoiceFormData.dueDate
                }
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Invoice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Complete */}
      {currentStep === "complete" && invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Application Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Application Submitted Successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your application has been created and invoice generated.
                </p>
              </div>
            </div>

            {application && (
              <div className="space-y-2">
                <h4 className="font-semibold">Application Details</h4>
                <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                  <p>
                    <strong>Application ID:</strong> {application.id}
                  </p>
                  {application.applicationStatus && (
                    <p>
                      <strong>Status:</strong> {application.applicationStatus}
                    </p>
                  )}
                  {application.submissionDate && (
                    <p>
                      <strong>Submission Date:</strong>{" "}
                      {formatDate(application.submissionDate)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">Invoice Details</h4>
              <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                <p>
                  <strong>Invoice Number:</strong>{" "}
                  {invoice.invoiceNumber || "N/A"}
                </p>
                <p>
                  <strong>Total Amount:</strong> {invoice.currency || "NGN"}{" "}
                  {(invoice.totalAmount ?? invoice.amount ?? 0).toLocaleString()}
                </p>
                {invoice.dueDate && (
                  <p>
                    <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                  </p>
                )}
                {invoice.status && (
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      variant={
                        invoice.status.toLowerCase() === "paid"
                          ? "default"
                          : invoice.status.toLowerCase() === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </p>
                )}
              </div>
            </div>

            {paymentStatus === "success" && (
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Payment Successful!
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your payment has been processed successfully.
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Payment Failed
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    There was an error processing your payment. Please try
                    again.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/seafarer/applications")}
              >
                View All Applications
              </Button>
              {invoice.status?.toLowerCase() !== "paid" &&
                paymentStatus !== "success" && (
                  <Button
                    onClick={handlePayInvoice}
                    disabled={isProcessingPayment}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                )}
              <Button
                onClick={() => {
                  setCurrentStep("select");
                  setSelectedCertificateId("");
                  setSelectedCertificate(null);
                  setRemarks("");
                  setApplication(null);
                  setInvoice(null);
                  setSelectedAttachments(new Map());
                  setCertificateFees([]);
                  setPaymentStatus(null);
                  setInvoiceFormData({
                    certificateFeeId: "",
                    nationalityType: "",
                    processingSpeed: "",
                    billingCategory: "",
                    dueDate: "",
                  });
                }}
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                Apply for Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
