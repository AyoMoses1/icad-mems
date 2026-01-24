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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getServiceById,
  getServiceChecklist,
  createApplication,
  submitApplication,
  generateApplicationInvoice,
  getApplicationById,
  type ServiceDto,
  type ApplicationRequirementDto,
  type ApplicationDto,
  type ApplicationInvoiceDto,
} from "@/lib/services/application-service";
import { uploadApplicationDocument } from "@/lib/services/document-service";
import {
  initiateApplicationPayment,
  simulatePayment,
  type InitiatePaymentResponse,
  type PaymentSimulateRequest,
} from "@/lib/services/payment-service";
import { getCurrencies, type CurrencyDto } from "@/lib/services/lookup-service";
import { formatDate } from "@/lib/utils";
import {
  getAllowedDocumentTypes,
  getAllowedDocumentTypeIds,
  isDocumentRequirement,
  hasAllDocumentUploads,
} from "@/lib/utils/requirement-helpers";
import { ApplicationRequirementErrorCodes } from "@/types/errors";

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
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentTypesId?: string;
  documentId?: string; // From API response
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

  // Document upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<string | null>(null);
  const [documentMetadata, setDocumentMetadata] = useState({
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadServiceData();
    }
  }, [serviceId]);

  // Refresh requirements when on requirements step and application is available
  // This ensures requirements are loaded even if they weren't in the create response
  useEffect(() => {
    const loadApplicationRequirements = async () => {
      // Only load if we're on requirements step, have an application, but no requirements yet
      if (currentStep === "requirements" && application && requirements.length === 0) {
        const appId = application.id || application.applicationId;
        if (appId) {
          try {
            const appResponse = await getApplicationById(appId);
            const appOk = appResponse.success ?? (appResponse as any).successful;
            if (appOk && appResponse.data?.requirements && Array.isArray(appResponse.data.requirements)) {
              const appReqs = appResponse.data.requirements;
              setRequirements(appReqs);
              
              // Initialize requirement values from application requirements
              const initialValues: RequirementValue[] = appReqs.map((req: any) => ({
                requirementId: req.applicationRequirementId || req.requirementListId || req.id || "",
                value: req.actualValue || "",
                notes: "",
              }));
              setRequirementValues(initialValues);
            }
          } catch (error) {
            console.error("Error loading application requirements:", error);
            // Don't show error to user - requirements might not be available yet
          }
        }
      }
    };

    loadApplicationRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, application?.id, application?.applicationId]);

  const loadServiceData = async () => {
    setIsLoading(true);
    try {
      // Step 1: Load service details
      const serviceResponse = await getServiceById(serviceId);
      const serviceOk = serviceResponse.success ?? (serviceResponse as any).successful;
      
      if (serviceOk && serviceResponse.data) {
        setService(serviceResponse.data);
      } else {
        toast.error(serviceResponse.message || "Service not found");
        router.back();
        return;
      }

      // Step 2: Load service checklist/requirements
      // V2: Checklist response now includes documentTypesId directly
      try {
        const checklistResponse = await getServiceChecklist(serviceId);
        console.log("Checklist response:", checklistResponse);
        
        // Check multiple possible response formats
        const checklistOk = checklistResponse.success ?? (checklistResponse as any).successful ?? true;
        const responseData = checklistResponse.data ?? (checklistResponse as any).data;
        
        if (checklistOk && responseData) {
          const reqs = Array.isArray(responseData) 
            ? responseData 
            : [];
          console.log("Loaded requirements:", reqs.length);
          setRequirements(reqs);
          
          // Initialize requirement values
          const initialValues: RequirementValue[] = reqs.map(req => ({
            requirementId: req.applicationRequirementId || req.requirementListId || req.id || "",
            value: "",
            notes: "",
          }));
          setRequirementValues(initialValues);
        } else {
          // If no requirements returned, set empty array
          console.log("No requirements found in response");
          setRequirements([]);
          setRequirementValues([]);
        }
      } catch (e: any) {
        console.error("Error loading service checklist:", e);
        // Show error to user if it's a network/API error
        if (e.message && !e.message.includes("404")) {
          toast.error("Failed to load service requirements. Please try again.");
        }
        // Some services might not have requirements configured yet
        setRequirements([]);
        setRequirementValues([]);
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
        
        // Get application ID for fetching requirements
        const appId = appData.id || appData.applicationId;
        
        // Fetch requirements from the application
        // The backend returns requirements in { data: [...] } format
        let appReqs: ApplicationRequirementDto[] = [];
        
        // First, try to get requirements from the create response
        if (appData.requirements && Array.isArray(appData.requirements)) {
          appReqs = appData.requirements;
        } else if (appId) {
          // If not in response, fetch the application again to get requirements
          try {
            const appResponse = await getApplicationById(appId);
            const appOk = appResponse.success ?? (appResponse as any).successful;
            if (appOk && appResponse.data?.requirements && Array.isArray(appResponse.data.requirements)) {
              appReqs = appResponse.data.requirements;
            }
          } catch (fetchError) {
            console.error("Error fetching application requirements:", fetchError);
            // Continue with empty requirements - will show "No requirements" message
          }
        }
        
        // Set requirements
        setRequirements(appReqs);
        
        // Initialize requirement values from application requirements
        const initialValues: RequirementValue[] = appReqs.map((req: any) => ({
          requirementId: req.applicationRequirementId || req.requirementListId || req.id || "",
          value: req.actualValue || "",
          notes: "",
        }));
        setRequirementValues(initialValues);
        
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

  const handleFileSelect = (requirementId: string, file: File | null) => {
    if (!file) return;

    // Get application ID - check both 'id' and 'applicationId' fields
    const appId = application?.id || application?.applicationId;
    if (!appId) {
      toast.error("Please create application first");
      return;
    }

    // Find requirement directly
    const requirement = requirements.find(
      req => {
        const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
        return reqId === requirementId;
      }
    );

    if (!requirement) {
      toast.error("Requirement not found");
      return;
    }

    // Check if this is a document requirement
    if (!isDocumentRequirement(requirement)) {
      toast.error("This requirement does not require a document upload");
      return;
    }

    // Get allowed document types
    const allowedTypes = getAllowedDocumentTypes(requirement);
    const allowedTypeIds = getAllowedDocumentTypeIds(requirement);

    if (allowedTypes.length === 0 && allowedTypeIds.length === 0) {
      toast.error(
        `Document type not found for "${requirement.requirementName}". ` +
        `Please contact support.`
      );
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds maximum allowed size of 10MB");
      return;
    }

    // Validate file extension
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`
      );
      return;
    }

    // If single type, set it automatically; if multiple, user will select
    const defaultTypeId = allowedTypeIds.length === 1 ? allowedTypeIds[0] : null;

    // Open dialog for metadata (and type selection if multiple types)
    setSelectedRequirementId(requirementId);
    setSelectedFile(file);
    setSelectedDocumentTypeId(defaultTypeId);
    setDocumentMetadata({
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
    });
    setUploadDialogOpen(true);
  };

  const handleUploadDocument = async () => {
    if (!selectedRequirementId || !selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    // Get application ID
    const appId = application?.id || application?.applicationId;
    if (!appId) {
      toast.error("Application not found");
      return;
    }

    // Find requirement directly
    const requirement = requirements.find(
      req => {
        const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
        return reqId === selectedRequirementId;
      }
    );

    if (!requirement) {
      toast.error("Requirement not found");
      return;
    }

    // Check if this is a document requirement
    if (!isDocumentRequirement(requirement)) {
      toast.error("This requirement does not require a document upload");
      return;
    }

    // Get allowed document type IDs
    const allowedTypeIds = getAllowedDocumentTypeIds(requirement);
    
    // Determine document type ID to use
    let documentTypeId: string | null = null;
    
    if (allowedTypeIds.length === 1) {
      // Single type - use it
      documentTypeId = allowedTypeIds[0];
    } else if (selectedDocumentTypeId) {
      // Multiple types - use selected one
      if (allowedTypeIds.includes(selectedDocumentTypeId)) {
        documentTypeId = selectedDocumentTypeId;
      } else {
        toast.error("Selected document type is not allowed for this requirement");
        return;
      }
    } else {
      toast.error("Please select a document type");
      return;
    }

    if (!documentTypeId) {
      toast.error("Document type not found for this requirement");
      return;
    }

    setIsUploading(true);
    try {
      // Format dates for API (YYYY-MM-DD format)
      const issueDate = documentMetadata.issueDate 
        ? new Date(documentMetadata.issueDate).toISOString().split('T')[0]
        : undefined;
      const expiryDate = documentMetadata.expiryDate 
        ? new Date(documentMetadata.expiryDate).toISOString().split('T')[0]
        : undefined;

      console.log("Uploading document:", {
        applicationId: appId,
        requirementId: selectedRequirementId,
        requirementName: requirement.requirementName,
        documentTypesId: documentTypeId,
        documentTypeDescription: requirement.documentTypeDescription,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        metadata: documentMetadata,
      });

      // V2: Upload document using documentTypesId directly from requirement
      const response = await uploadApplicationDocument(appId, {
        file: selectedFile,
        documentTypesId: documentTypeId,
        documentNumber: documentMetadata.documentNumber || undefined,
        issueDate: issueDate,
        expiryDate: expiryDate,
        issuingAuthority: documentMetadata.issuingAuthority || undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        // Store the upload in our state
        setDocumentUploads(prev => {
          const newMap = new Map(prev);
          newMap.set(selectedRequirementId, { 
            requirementId: selectedRequirementId, 
            file: selectedFile,
            documentTypesId: documentTypeId,
            documentNumber: documentMetadata.documentNumber,
            issueDate: issueDate,
            expiryDate: expiryDate,
            issuingAuthority: documentMetadata.issuingAuthority,
            documentId: response.data?.documentId,
          });
          return newMap;
        });
        
        // Update requirement value with document reference
        setRequirementValues(prev => 
          prev.map(rv => 
            rv.requirementId === selectedRequirementId 
              ? { ...rv, value: response.data?.documentId || selectedFile.name }
              : rv
          )
        );
        
        toast.success(`Document "${requirement.requirementName}" uploaded successfully`);
        
        // Close dialog and reset
        setUploadDialogOpen(false);
        setSelectedRequirementId(null);
        setSelectedFile(null);
        setSelectedDocumentTypeId(null);
        setDocumentMetadata({
          documentNumber: "",
          issueDate: "",
          expiryDate: "",
          issuingAuthority: "",
        });
      } else {
        const errorMsg = response.message || response.error?.message || "Failed to upload document";
        console.error("Upload failed:", response);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      const errorMsg = error.message || error.response?.data?.message || "Failed to upload document";
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (requirementId: string) => {
    setDocumentUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(requirementId);
      return newMap;
    });
    
    // Clear requirement value
    setRequirementValues(prev => 
      prev.map(rv => 
        rv.requirementId === requirementId 
          ? { ...rv, value: "" }
          : rv
      )
    );
    
    toast.success("Document removed");
  };

  const handleSubmitApplication = async () => {
    // Get application ID - check both 'id' and 'applicationId' fields
    const appId = application?.id || application?.applicationId;
    if (!appId) {
      toast.error("Application not found");
      return;
    }

    // Validate all required requirements are filled
    // Document requirements: check if uploaded with valid document type
    // Non-document requirements: check if value provided based on metric type
    // Skip validation for already submitted requirements
    const requiredReqs = requirements.filter((req: any) => {
      const isRequired = req.requiredValue === "Required" || req.isRequired;
      return isRequired && !req.isSubmitted;
    });

    // Check document requirements: each must have an upload and type must be in allowed set
    const docReqs = requiredReqs.filter((req: any) => isDocumentRequirement(req));
    const missingUploadReqs = docReqs.filter((req: any) => {
      const reqId = req.applicationRequirementId || req.requirementListId || req.id;
      return !documentUploads.has(reqId);
    });
    if (missingUploadReqs.length > 0) {
      toast.error(
        `Please upload documents for: ${missingUploadReqs.map((r: any) => r.requirementName).join(", ")}`
      );
      return;
    }

    const uploadedDocTypeIds = docReqs
      .map((r: any) => {
        const reqId = r.applicationRequirementId || r.requirementListId || r.id;
        return documentUploads.get(reqId)?.documentTypesId;
      })
      .filter((id): id is string => !!id);

    if (!hasAllDocumentUploads(requiredReqs, uploadedDocTypeIds)) {
      toast.error(
        "One or more document requirements have an invalid document type. " +
          "Please ensure each upload matches an allowed type for that requirement."
      );
      return;
    }

    // Check non-document requirements
    const missingRequired = requiredReqs
      .filter((req: any) => !isDocumentRequirement(req))
      .filter((req: any) => {
        const reqId = req.applicationRequirementId || req.requirementListId || req.id;
        const metricType = req.metricDescription || req.metricType || "Text";
        const isDate = metricType === "Date";
        const isYesNo = metricType === "Yes/No";
        
        if (isDate) {
          // For date requirements, check if valid date is provided
          const value = requirementValues.find(rv => rv.requirementId === reqId);
          if (!value?.value) return true;
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          return !dateRegex.test(value.value);
        } else if (isYesNo) {
          // For Yes/No requirements, check if value is provided (Yes or No)
          const value = requirementValues.find(rv => rv.requirementId === reqId);
          return !value?.value || (value.value !== "Yes" && value.value !== "No");
        } else {
          // For text requirements, check if value was provided
          const value = requirementValues.find(rv => rv.requirementId === reqId);
          return !value?.value || value.value.trim() === "";
        }
      });

    if (missingRequired.length > 0) {
      toast.error(`Please complete all required fields: ${missingRequired.map((r: any) => r.requirementName).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Build requirement values - only include non-document requirements
      // V2: Document requirements are handled through ApplicationDocument records (uploaded separately)
      const submitRequirementValues = requirements
        .map((req: any) => {
          const reqId = req.applicationRequirementId || req.requirementListId || req.id;
          // Skip document requirements - they're handled via ApplicationDocument
          if (isDocumentRequirement(req)) {
            return null;
          }
          
          // Only include text/date/yes-no requirements
          const value = requirementValues.find(rv => rv.requirementId === reqId);
          
          if (!value?.value) {
            return null;
          }
          
          return {
            requirementListId: req.requirementListId || reqId,
            actualValue: value.value,
          };
        })
        .filter((rv): rv is { requirementListId: string; actualValue: string } => rv !== null);

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
        await handleGenerateInvoice();
      } else {
        // Handle specific error codes
        const errorCode = response.error?.code;
        const errorMessage = response.error?.message || response.message;
        
        if (errorCode === ApplicationRequirementErrorCodes.MISSING_DOCUMENT) {
          toast.error(
            "One or more document requirements are missing valid uploads. " +
            "Please ensure all document requirements have at least one uploaded document of an allowed type."
          );
        } else if (errorCode === ApplicationRequirementErrorCodes.DOCUMENT_TYPE_REQUIRED) {
          toast.error(
            "A requirement is missing document type configuration. Please contact support."
          );
        } else if (errorCode === ApplicationRequirementErrorCodes.REQUIREMENT_CREATION_FAILED) {
          toast.error(
            "Failed to process requirements. Please check that all document types are properly configured."
          );
        } else {
          toast.error(errorMessage || "Failed to submit application");
        }
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    // Get application ID - check both 'id' and 'applicationId' fields
    const appId = application?.id || application?.applicationId;
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
    // Get application ID - check both 'id' and 'applicationId' fields
    const appId = application?.id || application?.applicationId;
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

  const handleSimulatePayment = async () => {
    // Get application ID - check both 'id' and 'applicationId' fields
    const appId = application?.id || application?.applicationId;
    if (!appId) {
      toast.error("Application not found");
      return;
    }

    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Get currency - invoice doesn't return currency, so we need to get it from service or use default
      let currency = invoice.currency;
      
      if (!currency) {
        // Try to get currency from service's currencyId
        try {
          const currenciesResponse = await getCurrencies();
          const currenciesOk = currenciesResponse.success ?? (currenciesResponse as any).successful;
          
          if (currenciesOk && currenciesResponse.data && currenciesResponse.data.length > 0) {
            const currencies: CurrencyDto[] = currenciesResponse.data;
            
            // First, try to get currency from service's currencyId if available
            if (service?.currencyId) {
              const serviceCurrency = currencies.find(
                (c: CurrencyDto) => c.currencyId === service.currencyId
              );
              if (serviceCurrency?.code) {
                currency = serviceCurrency.code;
              }
            }
            
            // If still no currency, try common currencies based on error patterns
            // The backend error showed invoice currency is "GBP", so prefer GBP
            if (!currency) {
              const gbpCurrency = currencies.find((c: CurrencyDto) => c.code === "GBP");
              const ngnCurrency = currencies.find((c: CurrencyDto) => c.code === "NGN");
              
              // Prefer GBP (since backend error showed invoice uses GBP), then NGN, then first available
              currency = gbpCurrency?.code || ngnCurrency?.code || currencies[0]?.code || "GBP";
            }
          } else {
            // Fallback to GBP (since that's what the backend expects based on error)
            currency = "GBP";
          }
        } catch (currencyError) {
          console.error("Error fetching currencies:", currencyError);
          // Fallback to GBP as default (based on backend error message)
          currency = "GBP";
        }
      }

      const simulatePayload: PaymentSimulateRequest = {
        amount: invoice.amount || invoice.totalAmount || 0,
        currency: currency, // Use fetched/default currency
        transactionReference: `TXN-${Date.now()}`,
        paymentMethod: "SIMULATE",
        notes: `Simulated payment for application ${appId}`,
        payerName: "", // Can be populated from user profile if available
        payerEmail: "", // Can be populated from user profile if available
        payerPhone: "", // Can be populated from user profile if available
      };

      const response = await simulatePayment(appId, simulatePayload);
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        toast.success(response.data.message || "Payment simulated successfully");
        setCurrentStep("complete");
        // Optionally refresh the invoice to show updated payment status
        await handleGenerateInvoice();
      } else {
        // Check if error is about currency mismatch and provide helpful message
        const errorMessage = response.message || response.error?.message || "Failed to simulate payment";
        if (errorMessage.includes("currency") && errorMessage.includes("match")) {
          toast.error(
            `Currency mismatch: ${errorMessage}. ` +
            `Please ensure the invoice currency matches the payment currency. ` +
            `Current payment currency: ${currency}`
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Error simulating payment:", error);
      toast.error(error.message || "Failed to simulate payment");
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
        // Check if all required requirements are completed
        if (requirements.length === 0) return true;
        
        const allRequiredCompleted = requirements
          .filter((req: any) => {
            const isRequired = req.requiredValue === "Required" || req.isRequired;
            return isRequired;
          })
          .every((req: any) => {
            // If already submitted, it's completed
            if (req.isSubmitted) return true;
            
            const reqId = req.applicationRequirementId || req.requirementListId || req.id;
            const metricType = req.metricDescription || req.metricType || "Text";
            const isDocument = isDocumentRequirement(req);
            const isDate = metricType === "Date";
            const isYesNo = metricType === "Yes/No";
            
            if (isDocument) {
              // For document requirements, check if document was uploaded
              return documentUploads.has(reqId);
            } else if (isDate) {
              // For date requirements, check if valid date is provided
              const value = requirementValues.find(rv => rv.requirementId === reqId);
              if (!value?.value) return false;
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              return dateRegex.test(value.value);
            } else if (isYesNo) {
              // For Yes/No requirements, check if value is provided (Yes or No)
              const value = requirementValues.find(rv => rv.requirementId === reqId);
              return value?.value === "Yes" || value?.value === "No";
            } else {
              // For text requirements, check if value is provided
              const value = requirementValues.find(rv => rv.requirementId === reqId);
              return value?.value && value.value.trim() !== "";
            }
          });
        
        return allRequiredCompleted;
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

            {/* Show Requirements Preview */}
            {requirements.length > 0 && (
              <div className="space-y-2">
                <Label>Requirements for this service ({requirements.length})</Label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 max-h-60 overflow-y-auto">
                  {requirements.map((req: any) => {
                    const metricType = req.metricDescription || req.metricType || "Text";
                    const isRequired = req.requiredValue === "Required" || req.isRequired;
                    return (
                      <div key={req.applicationRequirementId || req.requirementListId || req.id || ""} className="flex items-start gap-2 text-sm">
                        <span className={isRequired ? "text-red-500" : "text-muted-foreground"}>
                          {isRequired ? "•" : "○"}
                        </span>
                        <div className="flex-1">
                          <span className="font-medium">{req.requirementName}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {metricType}
                          </Badge>
                          {req.requirementDescription && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {req.requirementDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  You will be able to fulfill these requirements after creating the application.
                </p>
              </div>
            )}

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
                Application: {application.rn || application.id || application.applicationId}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!application ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please create the application first</p>
              </div>
            ) : requirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No specific requirements for this service</p>
                <p className="text-sm">You can proceed to the next step</p>
              </div>
            ) : (
              <>
                {/* Requirements Summary */}
                {(() => {
                  const totalRequired = requirements.filter((req: any) => 
                    req.requiredValue === "Required" || req.isRequired
                  ).length;
                  const completed = requirements.filter((req: any) => {
                    const reqId = req.applicationRequirementId || req.requirementListId || req.id;
                    const isDocument = isDocumentRequirement(req);
                    
                    if (req.isSubmitted) return true;
                    if (isDocument) {
                      return documentUploads.has(reqId);
                    } else {
                      const value = requirementValues.find(rv => rv.requirementId === reqId);
                      return value?.value && value.value.trim() !== "";
                    }
                  }).length;
                  
                  return (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Requirements Progress
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {completed} of {requirements.length} completed
                            {totalRequired > 0 && ` (${totalRequired} required)`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900">
                            {requirements.length > 0 ? Math.round((completed / requirements.length) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${requirements.length > 0 ? (completed / requirements.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-6">
                {requirements.map((req: any) => {
                  const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                  
                  // Determine metric type
                  const metricType = req.metricDescription || req.metricType || "Text";
                  const isDocument = isDocumentRequirement(req);
                  const isDate = metricType === "Date";
                  const isYesNo = metricType === "Yes/No";
                  const isText = metricType === "Text" || (!isDocument && !isDate && !isYesNo);
                  const isRequired = req.requiredValue === "Required" || req.isRequired;
                  const allowedTypeIds = getAllowedDocumentTypeIds(req);
                  const hasDocumentTypeMatch = allowedTypeIds.length > 0;
                  
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
                          {metricType}
                        </Badge>
                      </div>
                      
                      {req.isSubmitted && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Already submitted</span>
                          {req.dateSubmitted && (
                            <span className="text-xs text-muted-foreground">
                              ({formatDate(req.dateSubmitted)})
                            </span>
                          )}
                        </div>
                      )}
                      
                      {(() => {
                        const allowedTypes = getAllowedDocumentTypes(req);
                        if (allowedTypes.length > 0) {
                          return (
                            <p className="text-sm text-muted-foreground mb-2">
                              Document Type{allowedTypes.length > 1 ? "s" : ""}:{" "}
                              <span className="font-medium">
                                {allowedTypes.map(t => t.description).join(", ")}
                              </span>
                            </p>
                          );
                        } else if (req.documentTypeDescription) {
                          return (
                            <p className="text-sm text-muted-foreground mb-2">
                              Document Type: <span className="font-medium">{req.documentTypeDescription}</span>
                            </p>
                          );
                        }
                        return null;
                      })()}
                      
                      {isDocument ? (
                        <div className="mt-3 space-y-2">
                          {!hasDocumentTypeMatch && (
                            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                              <AlertCircle className="h-4 w-4 inline mr-1" />
                              Warning: Document type "{req.requirementName}" not found in system. 
                              Please contact support.
                            </div>
                          )}
                          
                          {req.isSubmitted ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                  Document already submitted
                                </span>
                              </div>
                            </div>
                          ) : !documentUploads.has(reqId) ? (
                            <>
                              <Input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileSelect(reqId, file);
                                  }
                                }}
                                className="cursor-pointer"
                                disabled={!hasDocumentTypeMatch || !application || req.isSubmitted}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              />
                              <p className="text-xs text-muted-foreground">
                                Max size: 10MB. Allowed: PDF, JPG, PNG, DOC, DOCX
                              </p>
                              {!application && (
                                <p className="text-xs text-amber-600">
                                  Please create the application first before uploading documents.
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-900">
                                      {documentUploads.get(reqId)?.file.name}
                                    </p>
                                    {documentUploads.get(reqId)?.documentNumber && (
                                      <p className="text-xs text-green-700">
                                        Document #: {documentUploads.get(reqId)?.documentNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveDocument(reqId)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={req.isSubmitted}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isDate ? (
                        <div className="mt-3">
                          {req.isSubmitted ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                  {req.actualValue ? formatDate(req.actualValue) : "Submitted"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Input
                                type="date"
                                value={requirementValues.find(rv => rv.requirementId === reqId)?.value || ""}
                                onChange={(e) => {
                                  const dateValue = e.target.value; // Already in YYYY-MM-DD format
                                  updateRequirementValue(reqId, dateValue);
                                }}
                                className="w-full"
                                disabled={req.isSubmitted}
                              />
                              {req.requiredValue && req.requiredValue !== "Required" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expected: {req.requiredValue}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ) : isYesNo ? (
                        <div className="mt-3">
                          {req.isSubmitted ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                  {req.actualValue || "Submitted"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-3">
                                <Switch
                                  checked={requirementValues.find(rv => rv.requirementId === reqId)?.value === "Yes" || false}
                                  onCheckedChange={(checked) => {
                                    updateRequirementValue(reqId, checked ? "Yes" : "No");
                                  }}
                                  disabled={req.isSubmitted}
                                />
                                <Label className="font-normal">
                                  {requirementValues.find(rv => rv.requirementId === reqId)?.value === "Yes" ? "Yes" : "No"}
                                </Label>
                              </div>
                              {req.requiredValue && req.requiredValue !== "Required" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expected: {req.requiredValue}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          {req.isSubmitted ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">
                                  {req.actualValue || "Submitted"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Textarea
                                value={requirementValues.find(rv => rv.requirementId === reqId)?.value || ""}
                                onChange={(e) => updateRequirementValue(reqId, e.target.value)}
                                placeholder={`Enter ${req.requirementName}...`}
                                rows={2}
                                disabled={req.isSubmitted}
                              />
                              {req.requiredValue && req.requiredValue !== "Required" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expected: {req.requiredValue}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep("info")} disabled>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => {
                  if (canProceed()) {
                    setCurrentStep("review");
                  } else {
                    toast.error("Please complete all required requirements before proceeding");
                  }
                }}
                disabled={!canProceed()}
                className="bg-[#3EADC0] hover:bg-[#35a0b3] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-sm">Reference: <span className="font-mono">{application.id || application.applicationId || "N/A"}</span></p>
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
                    const metricType = req.metricDescription || req.metricType || "Text";
                    // Check if document requirement
                    const isDocument = isDocumentRequirement(req);
                    const isDate = metricType === "Date";
                    const isYesNo = metricType === "Yes/No";
                    const hasValue = isDocument ? (hasUpload || req.isSubmitted) : (value?.value || req.isSubmitted);
                    const isRequired = req.requiredValue === "Required" || req.isRequired;
                    
                    // Format display value based on metric type
                    let displayValue = "";
                    if (hasUpload) {
                      displayValue = documentUploads.get(reqId)?.file.name || "";
                    } else if (value?.value) {
                      if (isDate) {
                        // Format date from YYYY-MM-DD to readable format
                        try {
                          const date = new Date(value.value + "T00:00:00");
                          displayValue = date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                        } catch {
                          displayValue = value.value;
                        }
                      } else if (isYesNo) {
                        // Display Yes/No clearly
                        displayValue = value.value === "Yes" ? "Yes" : value.value === "No" ? "No" : value.value;
                      } else {
                        // Text value - show first 50 characters
                        displayValue = value.value.substring(0, 50);
                        if (value.value.length > 50) {
                          displayValue += "...";
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={reqId}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <span className="text-sm font-medium">{req.requirementName}</span>
                          <p className="text-xs text-muted-foreground">
                            {metricType}
                            {isRequired && " (Required)"}
                          </p>
                          {displayValue && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {displayValue}
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
                    {invoice.invoiceNumber || 
                      (invoice.invoiceId 
                        ? `INV-${invoice.invoiceId.split('-')[0].toUpperCase()}` 
                        : invoice.id 
                          ? `INV-${invoice.id.toString().slice(0, 8).toUpperCase()}` 
                          : "INV-N/A")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">
                    {invoice.currency || "NGN"} {((invoice.totalAmount ?? invoice.amount) ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
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
                  
                  {/* Simulate Payment Button (for testing/development) */}
                  <Button
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Simulate Payment (Test)
                      </>
                    )}
                  </Button>
                </div>
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

      {/* Document Upload Dialog with Metadata */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {selectedRequirementId && requirements.find(
                req => {
                  const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                  return reqId === selectedRequirementId;
                }
              )?.requirementName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && selectedRequirementId && (() => {
            const requirement = requirements.find(
              req => {
                const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                return reqId === selectedRequirementId;
              }
            );
            const allowedTypes = requirement ? getAllowedDocumentTypes(requirement) : [];
            const hasMultipleTypes = allowedTypes.length > 1;
            
            return (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected File</p>
                  <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {hasMultipleTypes && (
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select
                      value={selectedDocumentTypeId || ""}
                      onValueChange={(value) => setSelectedDocumentTypeId(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTypes.map((type) => (
                          <SelectItem key={type.documentTypesId} value={type.documentTypesId}>
                            {type.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Please select the type of document you are uploading
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Document Number (Optional)</Label>
                  <Input
                    id="documentNumber"
                    value={documentMetadata.documentNumber}
                    onChange={(e) =>
                      setDocumentMetadata(prev => ({ ...prev, documentNumber: e.target.value }))
                    }
                    placeholder="e.g., P123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date (Optional)</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={documentMetadata.issueDate}
                    onChange={(e) =>
                      setDocumentMetadata(prev => ({ ...prev, issueDate: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={documentMetadata.expiryDate}
                    onChange={(e) =>
                      setDocumentMetadata(prev => ({ ...prev, expiryDate: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority">Issuing Authority (Optional)</Label>
                  <Input
                    id="issuingAuthority"
                    value={documentMetadata.issuingAuthority}
                    onChange={(e) =>
                      setDocumentMetadata(prev => ({ ...prev, issuingAuthority: e.target.value }))
                    }
                    placeholder="e.g., NIMASA"
                  />
                </div>
              </div>
            </div>
            );
          })()}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
                setSelectedRequirementId(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              disabled={isUploading || !selectedFile || (() => {
                if (!selectedRequirementId) return true;
                const requirement = requirements.find(
                  req => {
                    const reqId = req.applicationRequirementId || req.requirementListId || req.id || "";
                    return reqId === selectedRequirementId;
                  }
                );
                if (!requirement) return true;
                const allowedTypes = getAllowedDocumentTypes(requirement);
                // If multiple types, require selection; if single, allow upload
                return allowedTypes.length > 1 && !selectedDocumentTypeId;
              })()}
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

