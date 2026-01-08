"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Loader2,
  AlertCircle,
  Clock,
  XCircle,
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
import { LoadingSpinner } from "@/components/shared";
import {
  getServiceById,
  getServiceChecklist,
  createApplication,
  submitApplication,
  generateApplicationInvoice,
  type ServiceDto,
  type ApplicationRequirementDto,
  type ApplicationDto,
  type ApplicationInvoiceDto,
} from "@/lib/services/application-service";
import { uploadApplicationDocument } from "@/lib/services/document-service";
import {
  initiateApplicationPayment,
  type InitiatePaymentResponse,
} from "@/lib/services/payment-service";
import { formatDate } from "@/lib/utils";

type Step = "info" | "requirements" | "review" | "invoice" | "complete";

interface RequirementValue {
  requirementId: string;
  value: string;
  notes?: string;
}

interface DocumentUpload {
  requirementId: string;
  file: File;
  documentNumber?: string;
}

export default function ServiceApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("info");

  // Service data
  const [service, setService] = useState<ServiceDto | null>(null);
  const [requirements, setRequirements] = useState<ApplicationRequirementDto[]>([]);

  // Application data
  const [application, setApplication] = useState<ApplicationDto | null>(null);
  const [remarks, setRemarks] = useState("");
  const [requirementValues, setRequirementValues] = useState<RequirementValue[]>([]);
  const [documentUploads, setDocumentUploads] = useState<Map<string, DocumentUpload>>(new Map());

  // Invoice & Payment
  const [invoice, setInvoice] = useState<ApplicationInvoiceDto | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceData();
    }
  }, [serviceId]);

  const loadServiceData = async () => {
    setIsLoading(true);
    try {
      // Load service details
      const serviceResponse = await getServiceById(serviceId);
      const serviceOk = serviceResponse.success ?? (serviceResponse as any).successful;
      
      if (serviceOk && serviceResponse.data) {
        setService(serviceResponse.data);
      } else {
        toast.error(serviceResponse.message || "Service not found");
        router.back();
        return;
      }

      // Load service checklist/requirements
      try {
        const checklistResponse = await getServiceChecklist(serviceId);
        const checklistOk = checklistResponse.success ?? (checklistResponse as any).successful;
        
        if (checklistOk && checklistResponse.data) {
          const reqs = Array.isArray(checklistResponse.data) 
            ? checklistResponse.data 
            : [];
          setRequirements(reqs);
          
          // Initialize requirement values
          const initialValues: RequirementValue[] = reqs.map(req => ({
            requirementId: req.requirementListId || req.id || "",
            value: "",
            notes: "",
          }));
          setRequirementValues(initialValues);
        }
      } catch (e) {
        console.log("No checklist available for this service");
      }
    } catch (error: any) {
      console.error("Error loading service:", error);
      toast.error(error.message || "Failed to load service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    setIsSubmitting(true);
    try {
      const response = await createApplication({
        serviceId: serviceId,
        remarks: remarks.trim() || undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        const appData = response.data;
        setApplication(appData);
        
        // Use requirements from the created application response
        if (appData.requirements && Array.isArray(appData.requirements)) {
          setRequirements(appData.requirements);
          
          // Initialize requirement values from application requirements
          const initialValues: RequirementValue[] = appData.requirements.map((req: any) => ({
            requirementId: req.applicationRequirementId || req.requirementListId || req.id || "",
            value: req.actualValue || "",
            notes: "",
          }));
          setRequirementValues(initialValues);
        }
        
        setCurrentStep("requirements");
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

  const handleUploadDocument = async (requirementId: string, file: File) => {
    if (!application?.id) {
      toast.error("Please create application first");
      return;
    }

    try {
      const response = await uploadApplicationDocument(application.id, {
        file,
        documentTypesId: requirementId, // Using requirement ID as document type
      });

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        // Store the upload in our state
        setDocumentUploads(prev => {
          const newMap = new Map(prev);
          newMap.set(requirementId, { requirementId, file });
          return newMap;
        });
        
        // Update requirement value with document reference
        setRequirementValues(prev => 
          prev.map(rv => 
            rv.requirementId === requirementId 
              ? { ...rv, value: response.data?.documentId || file.name }
              : rv
          )
        );
        
        toast.success("Document uploaded successfully");
      } else {
        toast.error(response.message || "Failed to upload document");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    }
  };

  const handleSubmitApplication = async () => {
    const appId = application?.applicationId || application?.id;
    if (!appId) {
      toast.error("Application not found");
      return;
    }

    // Validate all required requirements are filled
    const missingRequired = requirements
      .filter((req: any) => req.requiredValue === "Required" || req.isRequired)
      .filter((req: any) => {
        const reqId = req.applicationRequirementId || req.requirementListId || req.id;
        const value = requirementValues.find(rv => rv.requirementId === reqId);
        const hasUpload = documentUploads.has(reqId);
        return !value?.value && !hasUpload;
      });

    if (missingRequired.length > 0) {
      toast.error(`Please complete all required fields: ${missingRequired.map((r: any) => r.requirementName).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Build requirement values - use requirementListId for the API
      const submitRequirementValues = requirements.map((req: any) => {
        const reqId = req.applicationRequirementId || req.requirementListId || req.id;
        const value = requirementValues.find(rv => rv.requirementId === reqId);
        const upload = documentUploads.get(reqId);
        
        return {
          requirementListId: req.requirementListId || reqId,
          actualValue: upload ? upload.file.name : (value?.value || null),
        };
      }).filter(rv => rv.actualValue);

      const submitData = {
        applicationId: appId,
        remarks: remarks,
        requirementValues: submitRequirementValues,
      };

      const response = await submitApplication(appId, submitData);
      const ok = response.success ?? (response as any).successful;

      if (ok) {
        toast.success("Application submitted successfully");
        setCurrentStep("invoice");
        
        // Generate invoice
        await handleGenerateInvoice();
      } else {
        toast.error(response.message || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    const appId = application?.applicationId || application?.id;
    if (!appId) return;

    try {
      const response = await generateApplicationInvoice(appId);
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        setInvoice(response.data);
      }
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      // Invoice might already exist or not required
    }
  };

  const handlePayment = async () => {
    const appId = application?.applicationId || application?.id;
    if (!appId) {
      toast.error("Application not found");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await initiateApplicationPayment(appId);
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        const redirectUrl = response.data.paymentUrl || response.data.authorizationUrl;
        if (redirectUrl) {
          window.open(redirectUrl, "_blank");
          toast.success("Redirecting to payment gateway...");
          setCurrentStep("complete");
        } else {
          toast.error("Payment URL not available");
        }
      } else {
        toast.error(response.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const updateRequirementValue = (requirementId: string, value: string, notes?: string) => {
    setRequirementValues(prev =>
      prev.map(rv =>
        rv.requirementId === requirementId
          ? { ...rv, value, notes: notes !== undefined ? notes : rv.notes }
          : rv
      )
    );
  };

  const getStepProgress = () => {
    const steps: Step[] = ["info", "requirements", "review", "invoice", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const canProceed = () => {
    switch (currentStep) {
      case "info":
        return true;
      case "requirements":
        return true; // Validation happens on submit
      case "review":
        return true;
      default:
        return true;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Service not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Apply for {service.serviceName || service.name}
          </h1>
          <p className="text-muted-foreground">
            Complete the application process step by step
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep === "info" ? 1 
                : currentStep === "requirements" ? 2 
                : currentStep === "review" ? 3 
                : currentStep === "invoice" ? 4 
                : 5} of 5
            </span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between mt-4">
            {["Service Info", "Requirements", "Review", "Invoice", "Complete"].map((step, idx) => {
              const stepKeys: Step[] = ["info", "requirements", "review", "invoice", "complete"];
              const isActive = stepKeys.indexOf(currentStep) >= idx;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Service Info */}
      {currentStep === "info" && (
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg">{service.serviceName || service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
              )}
              {service.serviceType && (
                <Badge variant="outline" className="mt-2">{service.serviceType}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Application Notes (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional notes or comments for your application..."
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleCreateApplication}
                disabled={isSubmitting}
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Application
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Requirements */}
      {currentStep === "requirements" && (
        <Card>
          <CardHeader>
            <CardTitle>Application Requirements</CardTitle>
            {application && (
              <p className="text-sm text-muted-foreground">
                Application: {application.rn || application.applicationId || application.id}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No specific requirements for this service</p>
                <p className="text-sm">You can proceed to the next step</p>
              </div>
            ) : (
              <div className="space-y-6">
                {requirements.map((req: any) => {
                  const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                  const metricType = (req.metricDescription || req.metricType || "").toLowerCase();
                  const isDocument = metricType.includes("file") || metricType.includes("document");
                  const isRequired = req.requiredValue === "Required" || req.isRequired;
                  
                  return (
                    <div key={reqId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Label className="font-medium">
                            {req.requirementName}
                            {isRequired && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {req.requirementDescription && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {req.requirementDescription}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {req.metricDescription || req.metricType || "Text"}
                        </Badge>
                      </div>
                      
                      {req.isSubmitted && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Already submitted</span>
                        </div>
                      )}
                      
                      {isDocument ? (
                        <div className="mt-3">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadDocument(reqId, file);
                              }
                            }}
                            className="cursor-pointer"
                          />
                          {documentUploads.has(reqId) && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{documentUploads.get(reqId)?.file.name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Textarea
                            value={requirementValues.find(rv => rv.requirementId === reqId)?.value || ""}
                            onChange={(e) => updateRequirementValue(reqId, e.target.value)}
                            placeholder={`Enter ${req.requirementName}...`}
                            rows={2}
                          />
                          {req.requiredValue && req.requiredValue !== "Required" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expected: {req.requiredValue}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep("info")} disabled>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep("review")}
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
              >
                Continue to Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Application Info */}
            {application && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Application</h4>
                <p className="text-sm">Reference: <span className="font-mono">{application.rn || application.applicationId}</span></p>
                <p className="text-sm">Status: <Badge variant="outline">{application.applicationStatus || application.status || "DRAFT"}</Badge></p>
              </div>
            )}

            {/* Service Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Service</h4>
              <p>{application?.serviceName || service?.serviceName || service?.name}</p>
            </div>

            {/* Requirements Summary */}
            {requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requirements ({requirements.length})</h4>
                <div className="space-y-2">
                  {requirements.map((req: any) => {
                    const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                    const value = requirementValues.find(rv => rv.requirementId === reqId);
                    const hasUpload = documentUploads.has(reqId);
                    const hasValue = value?.value || hasUpload || req.isSubmitted;
                    const isRequired = req.requiredValue === "Required" || req.isRequired;
                    
                    return (
                      <div
                        key={reqId}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <span className="text-sm font-medium">{req.requirementName}</span>
                          <p className="text-xs text-muted-foreground">
                            {req.metricDescription || req.metricType}
                            {isRequired && " (Required)"}
                          </p>
                          {(value?.value || hasUpload) && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {hasUpload ? documentUploads.get(reqId)?.file.name : value?.value?.substring(0, 50)}
                            </p>
                          )}
                        </div>
                        {hasValue ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isRequired ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {remarks && (
              <div>
                <h4 className="font-medium mb-2">Application Notes</h4>
                <p className="text-sm bg-muted p-3 rounded">{remarks}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep("requirements")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requirements
              </Button>
              <Button 
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Invoice */}
      {currentStep === "invoice" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Application Submitted!</p>
                <p className="text-sm text-green-700">
                  Your application has been submitted successfully.
                </p>
              </div>
            </div>

            {invoice ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-mono font-bold">
                    {invoice.invoiceNumber || `INV-${(invoice.id || "").toString().slice(0, 8).toUpperCase()}`}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">
                    {invoice.currency || "NGN"} {((invoice.totalAmount ?? invoice.amount) ?? 0).toLocaleString()}
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Invoice is being generated. You will receive a notification when it's ready.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/seafarer/applications")}
            >
              View My Applications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Complete */}
      {currentStep === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle>Application Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Payment Initiated!</p>
                <p className="text-sm text-green-700">
                  Your payment is being processed. You will receive a confirmation once complete.
                </p>
              </div>
            </div>

            {application && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-mono">{application.id?.slice(0, 13).toUpperCase()}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/seafarer/applications")}
              >
                View All Applications
              </Button>
              <Button
                className="flex-1 bg-[#3EADC0] hover:bg-[#35a0b3]"
                onClick={() => router.push("/seafarer/services")}
              >
                Apply for Another Service
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

