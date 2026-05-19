"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store";
import { getImsUrl } from "@/lib/ims-url";
import {
  getServices,
  getServiceRequirements,
} from "@/lib/services/service-service";
import {
  createApplication,
  getApplicationById,
  fulfillApplicationRequirement,
  submitApplication,
} from "@/lib/services/application-service";
import {
  uploadUserDocument,
  getUserDocuments,
} from "@/lib/services/document-service";
import type {
  ServiceDto,
  ServiceRequirementDto,
  ApplicationRequirementDto,
} from "@/types/seafarer";
import type { ApplicationDto } from "@/types/payment";
import type { DocumentDto } from "@/lib/services/document-service";
import {
  getAllowedDocumentTypes,
  getAllowedDocumentTypeIds,
} from "@/lib/utils/requirement-helpers";

type Step = 1 | 2 | 3 | 4;

interface SelectedService {
  service: ServiceDto;
  requirements: ServiceRequirementDto[];
}

export default function ApplyCertificateLicensePage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Certificate Type Selection
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    Map<number, SelectedService>
  >(new Map());

  // Step 2: Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: "",
    nationality: "Nigerian",
    address: "",
  });

  // Step 3: Documents
  const [applicationRequirements, setApplicationRequirements] = useState<
    ApplicationRequirementDto[]
  >([]);
  const [documentUploads, setDocumentUploads] = useState<
    Map<
      number,
      {
        file: File | null;
        documentId: string | number | null;
        documentTypesId?: string;
      }
    >
  >(new Map());
  const [selectedDocTypeByReq, setSelectedDocTypeByReq] = useState<
    Map<number, string>
  >(new Map());
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentDto[]>([]);

  // Step 4: Review
  const [createdApplication, setCreatedApplication] =
    useState<ApplicationDto | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  useEffect(() => {
    // SSO: redirect to IMS to sign in (no local login page)
    if (!isAuthenticated || !token) {
      toast.error("Please sign in to continue");
      window.location.href = getImsUrl();
      return;
    }

    loadServices();
    loadUserDocuments();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (currentStep === 3 && createdApplication?.id) {
      loadApplicationRequirements();
    }
  }, [currentStep, createdApplication?.id]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await getServices({
        pageNumber: 1,
        pageSize: 1000,
        isActive: true,
      });

      if (response.success && response.data) {
        setServices(response.data.items);
      } else {
        toast.error(response.message || "Failed to load certificate types");
      }
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load certificate types");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDocuments = async () => {
    try {
      const response = await getUserDocuments();
      if (response.success && response.data) {
        setUploadedDocuments(response.data);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const loadApplicationRequirements = async () => {
    if (!createdApplication?.id) {
      console.warn("Cannot load requirements: application not created yet");
      return;
    }

    try {
      const response = await getApplicationById(String(createdApplication.id));
      const ok = response.success ?? (response as { successful?: boolean }).successful;
      const data = response.data ?? (response as { data?: unknown }).data;
      if (ok && data && typeof data === "object" && "requirements" in data) {
        const raw = (data as { requirements?: unknown }).requirements;
        const reqs = Array.isArray(raw) ? raw : [];
        const mappedRequirements = reqs.map((req) => ({
          id: req.applicationRequirementId
            ? Number(req.applicationRequirementId)
            : undefined,
          applicationId: Number(createdApplication.id),
          requirementName: req.requirementName,
          status: req.isSubmitted ? "submitted" : "pending",
          documentTypesId: (req as { documentTypesId?: string }).documentTypesId,
          documentTypeDescription: (req as { documentTypeDescription?: string }).documentTypeDescription,
          documentTypeIds: (req as { documentTypeIds?: string[] }).documentTypeIds,
          documentTypes: (req as { documentTypes?: { documentTypesId: string; description: string }[] }).documentTypes,
          metricDescription: (req as { metricDescription?: string }).metricDescription,
        })) as ApplicationRequirementDto[];
        setApplicationRequirements(mappedRequirements);
      } else {
        setApplicationRequirements([]);
      }
    } catch (error) {
      console.error("Error loading requirements:", error);
    }
  };

  const handleServiceToggle = async (service: ServiceDto) => {
    const newSelected = new Map(selectedServices);

    if (newSelected.has(service.id)) {
      newSelected.delete(service.id);
    } else {
      // Fetch requirements for this service
      try {
        const reqResponse = await getServiceRequirements(service.id);
        if (reqResponse.success && reqResponse.data) {
          newSelected.set(service.id, {
            service,
            requirements: reqResponse.data,
          });
        } else {
          toast.error("Failed to load service requirements");
          return;
        }
      } catch (error) {
        console.error("Error loading service requirements:", error);
        toast.error("Failed to load service requirements");
        return;
      }
    }

    setSelectedServices(newSelected);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (selectedServices.size === 0) {
        toast.error("Please select at least one certificate type");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate personal details
      if (!personalDetails.firstName || !personalDetails.lastName) {
        toast.error("Please fill in all required fields");
        return;
      }
      // Create application before moving to documents step
      const success = await handleCreateApplication();
      if (success) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // Check if all requirements are fulfilled
      const allFulfilled = applicationRequirements.every(
        (req) => req.status === "Fulfilled" || req.status === "Approved"
      );
      if (!allFulfilled) {
        toast.error("Please upload all required documents");
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleCreateApplication = async (): Promise<boolean> => {
    if (selectedServices.size === 0) {
      toast.error("Please select at least one certificate type");
      return false;
    }

    if (createdApplication) {
      return true; // Application already created
    }

    setIsSubmitting(true);
    try {
      // Create application for the first selected service
      // Note: The API might support multiple services, but we'll start with one
      const firstService = Array.from(selectedServices.values())[0];
      const response = await createApplication({
        serviceId: String(firstService.service.id),
        remarks: `Application for ${firstService.service.serviceName}`,
      });

      if (response.success && response.data) {
        // Convert to ApplicationDto format expected by state
        setCreatedApplication({
          id: Number(response.data.id ?? response.data.applicationId ?? 0),
          applicationNumber: response.data.rn,
          status: response.data.applicationStatus ?? response.data.status,
        } as any);
        toast.success("Application created successfully");
        // Load requirements after creating application
        await loadApplicationRequirements();
        return true;
      } else {
        toast.error(
          response.message || "Failed to create application. Please try again."
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (
    requirementId: number,
    file: File,
    documentTypeId: string
  ) => {
    if (!createdApplication) {
      toast.error("Application not found. Please try again.");
      return;
    }

    try {
      const uploadResponse = await uploadUserDocument({
        file,
        documentTypesId: documentTypeId,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        toast.error(
          (uploadResponse as any).error?.message || "Failed to upload document"
        );
        return;
      }

      const documentId = uploadResponse.data.documentId;

      // Fulfill requirement by linking the document
      const fulfillResponse = await fulfillApplicationRequirement(
        String(createdApplication.id),
        String(requirementId),
        {
          documentId: documentId,
        }
      );

      if (fulfillResponse.success && fulfillResponse.data) {
        const newUploads = new Map(documentUploads);
        newUploads.set(requirementId, {
          file,
          documentId,
          documentTypesId: documentTypeId,
        });
        setDocumentUploads(newUploads);

        // Reload requirements to update status
        await loadApplicationRequirements();
        toast.success("Document uploaded successfully");
      } else {
        toast.error(
          fulfillResponse.error?.message ||
            "Failed to link document to requirement"
        );
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  };

  const handleSubmit = async () => {
    if (!termsAccepted || !infoConfirmed) {
      toast.error("Please accept the terms and confirm the information");
      return;
    }

    if (!createdApplication) {
      toast.error("Application not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitApplication(String(createdApplication.id), {
        applicationId: String(createdApplication.id),
        remarks: "Application submitted",
      });

      if (response.success && response.data) {
        toast.success("Application submitted successfully!");
        router.push("/license-certification");
      } else {
        toast.error(
          response.message || "Failed to submit application. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Certificate Type", desc: "Select certificate type" },
      { number: 2, title: "Personal Details", desc: "Verify your information" },
      { number: 3, title: "Documents", desc: "Upload required documents" },
      { number: 4, title: "Review & Submit", desc: "Confirm application" },
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isActive
                      ? "bg-[#3EADC0] text-white"
                      : isCompleted
                        ? "bg-[#3EADC0] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-[#3EADC0]" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? "bg-[#3EADC0]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Certificate Type</h2>
      {services.map((service) => {
        const isSelected = selectedServices.has(service.id);
        return (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              isSelected ? "border-[#3EADC0] border-2" : ""
            }`}
            onClick={() => handleServiceToggle(service)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <div>
                    <p className="font-medium">{service.serviceName}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {service.currency || "₦"}
                    {service.fee?.toLocaleString() || "25,000"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Verify Personal Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={personalDetails.firstName}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                firstName: e.target.value,
              })
            }
            placeholder="Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={personalDetails.lastName}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                lastName: e.target.value,
              })
            }
            placeholder="Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={personalDetails.email}
            onChange={(e) =>
              setPersonalDetails({ ...personalDetails, email: e.target.value })
            }
            placeholder="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={personalDetails.phoneNumber}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                phoneNumber: e.target.value,
              })
            }
            placeholder="Number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={personalDetails.dateOfBirth}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                dateOfBirth: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={personalDetails.nationality}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                nationality: e.target.value,
              })
            }
            placeholder="Nigerian"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={personalDetails.address}
          onChange={(e) =>
            setPersonalDetails({ ...personalDetails, address: e.target.value })
          }
          placeholder="Enter full address"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">
          Upload Required Documents
        </h2>
        {applicationRequirements.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-4">
            {applicationRequirements.map((req) => {
              const reqId = req.id || 0;
              const upload = documentUploads.get(reqId);
              const isFulfilled =
                req.status === "Fulfilled" || req.status === "Approved";
              const allowedTypes = getAllowedDocumentTypes(req);
              const allowedIds = getAllowedDocumentTypeIds(req);
              const hasMultiple = allowedTypes.length > 1;
              const singleTypeId = allowedIds.length === 1 ? allowedIds[0] : null;
              const selectedType = selectedDocTypeByReq.get(reqId);
              const resolvedTypeId = singleTypeId ?? selectedType ?? null;
              const uploadDisabled =
                !createdApplication ||
                isFulfilled ||
                !resolvedTypeId ||
                (hasMultiple && !selectedType);

              return (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium">
                            {req.requirementName || "Document"}
                          </h3>
                          {isFulfilled && (
                            <Badge variant="default" className="ml-2">
                              Uploaded
                            </Badge>
                          )}
                        </div>
                        {allowedTypes.length > 0 && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Document type{allowedTypes.length > 1 ? "s" : ""}:{" "}
                            {allowedTypes.map((t) => t.description).join(", ")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {req.requirementName?.includes("Passport")
                            ? "Clear copy of data page"
                            : req.requirementName?.includes("Photograph")
                              ? "Recent white background photo"
                              : req.requirementName?.includes("Training")
                                ? "From approved institute"
                                : req.requirementName?.includes("Medical")
                                  ? "Not older than 6 months"
                                  : "Please upload a clear copy"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!isFulfilled && (
                          <>
                            {hasMultiple && (
                              <Select
                                value={selectedType ?? ""}
                                onValueChange={(v) => {
                                  const m = new Map(selectedDocTypeByReq);
                                  m.set(reqId, v);
                                  setSelectedDocTypeByReq(m);
                                }}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allowedTypes.map((t) => (
                                    <SelectItem
                                      key={t.documentTypesId}
                                      value={t.documentTypesId}
                                    >
                                      {t.description}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {uploadDisabled ? (
                              <Button
                                type="button"
                                variant="outline"
                                disabled
                                className="cursor-not-allowed"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </Button>
                            ) : (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (
                                      file &&
                                      createdApplication &&
                                      resolvedTypeId
                                    ) {
                                      handleDocumentUpload(
                                        reqId,
                                        file,
                                        resolvedTypeId
                                      );
                                    }
                                    e.target.value = "";
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="cursor-pointer pointer-events-none"
                                  tabIndex={-1}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload
                                </Button>
                              </label>
                            )}
                          </>
                        )}
                        {isFulfilled && (
                          <Badge variant="default">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => {
    const firstService = Array.from(selectedServices.values())[0];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Review Your Application</h2>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name: </span>
                  <span className="font-medium">
                    {personalDetails.firstName} {personalDetails.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">
                    {personalDetails.phoneNumber}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{personalDetails.email}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Selected Certificate</h3>
              <p className="text-sm">
                {firstService?.service.serviceName || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Uploaded Documents</h3>
              <div className="flex flex-wrap gap-2">
                {applicationRequirements
                  .filter(
                    (req) =>
                      req.status === "Fulfilled" || req.status === "Approved"
                  )
                  .map((req) => (
                    <Badge key={req.id} variant="outline" className="px-3 py-1">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {req.requirementName}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked === true)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  By submitting this application, I agree to the terms and
                  conditions
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirm"
                  checked={infoConfirmed}
                  onCheckedChange={(checked) =>
                    setInfoConfirmed(checked === true)
                  }
                />
                <label
                  htmlFor="confirm"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  I confirm that all information provided is accurate
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Apply for New Certificate/License"
          description="Complete the application form to request a new certificate"
        />
      </div>

      {renderStepIndicator()}

      <Card>
        <CardContent className="p-6">
          {isLoading && currentStep === 1 ? (
            <LoadingSpinner />
          ) : (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((currentStep - 1) as Step)}
                    disabled={isSubmitting}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !termsAccepted || !infoConfirmed}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

