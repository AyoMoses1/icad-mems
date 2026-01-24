"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  Phone,
  Building,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store";
import {
  submitComprehensiveOnboarding,
  type ComprehensiveOnboardingRequest,
  type ContactDetailsRequest,
  type InstitutionDocumentRequest,
} from "@/lib/services/comprehensive-onboarding-service";
import { handleApiError } from "@/lib/error-handler";
import {
  getDocumentTypes,
  getAccreditedInstitutions,
  type DocumentTypeDto,
  type AccreditedInstitutionDto,
} from "@/lib/services/lookup-service";

type Step = "institution" | "contact" | "documents" | "review";

interface DocumentUpload {
  documentTypesId: string;
  file: File | null;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

export function TrainingInstitutionOnboardingForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("institution");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [institutions, setInstitutions] = useState<AccreditedInstitutionDto[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Institution Details
  const [institutionData, setInstitutionData] = useState({
    accreditedInstitutionId: "",
    roleSpecificIdentifier: "",
    department: "",
    jobTitle: "",
    notes: "",
  });

  // Contact Details
  const [contactData, setContactData] = useState<ContactDetailsRequest>({
    phone: user?.phoneNumber || "",
    email: user?.email || "",
    address: "",
    emergencyContactPerson: "",
    relationship: "",
    emergencyContactNumber: "",
    emergencyContactAddress: "",
  });

  // Institution Documents
  const [institutionDocuments, setInstitutionDocuments] = useState<
    DocumentUpload[]
  >([]);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [docTypesRes, institutionsRes] = await Promise.all([
          getDocumentTypes(),
          getAccreditedInstitutions("TRAINING"),
        ]);

        if (docTypesRes.data) {
          setDocumentTypes(docTypesRes.data);
        }
        if (institutionsRes.data) {
          setInstitutions(institutionsRes.data);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load required data. Please refresh the page.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleAddDocument = () => {
    setInstitutionDocuments([
      ...institutionDocuments,
      {
        documentTypesId: "",
        file: null,
        documentNumber: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
      },
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    setInstitutionDocuments(institutionDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    try {
      setIsSubmitting(true);

      // Validation for non-draft submissions
      if (!saveAsDraft) {
        if (!institutionData.accreditedInstitutionId) {
          toast.error("Please select an accredited institution");
          setCurrentStep("institution");
          return;
        }

        if (!institutionData.roleSpecificIdentifier) {
          toast.error("Please enter institution registration number");
          setCurrentStep("institution");
          return;
        }

        if (!contactData.phone || !contactData.email || !contactData.address) {
          toast.error("Please fill in all required contact details");
          setCurrentStep("contact");
          return;
        }

        if (institutionDocuments.filter((doc) => doc.file).length === 0) {
          toast.error("Please upload at least one institution document");
          setCurrentStep("documents");
          return;
        }
      }

      // Prepare the request data
      const requestData: ComprehensiveOnboardingRequest = {
        role: "TRAINING_INSTITUTION", // Required: Role must be TRAINING_INSTITUTION for training institution onboarding
        saveAsDraft,
        accreditedInstitutionId: institutionData.accreditedInstitutionId,
        roleSpecificIdentifier: institutionData.roleSpecificIdentifier,
        department: institutionData.department || undefined,
        jobTitle: institutionData.jobTitle || undefined,
        notes: institutionData.notes || undefined,
        contactDetails: contactData,
        institutionDocuments: institutionDocuments
          .filter((doc) => doc.file && doc.documentTypesId)
          .map((doc) => ({
            documentTypesId: doc.documentTypesId,
            file: doc.file!,
            documentNumber: doc.documentNumber,
            issueDate: doc.issueDate,
            issuingAuthority: doc.issuingAuthority,
            expiryDate: doc.expiryDate,
          })),
      };

      const response = await submitComprehensiveOnboarding(requestData);

      if (response.success && response.data) {
        const { summary } = response.data;

        if (summary.warnings && summary.warnings.length > 0) {
          summary.warnings.forEach((warning) => toast.warning(warning));
        }

        toast.success(
          summary.message ||
            (saveAsDraft
              ? "Draft saved successfully!"
              : "Onboarding completed successfully!")
        );

        router.push("/institution/dashboard");
      } else {
        toast.error(response.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = () => {
    const steps = ["institution", "contact", "documents", "review"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const nextStep = () => {
    const steps: Step[] = ["institution", "contact", "documents", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["institution", "contact", "documents", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading required data...</span>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Training Institution Onboarding"
          description="Complete your institution representative profile"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    No Accredited Institutions Available
                  </h3>
                  <p className="text-sm text-yellow-800">
                    There are no accredited training institutions in the system.
                    Please contact your administrator to add your institution
                    before proceeding with onboarding.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Institution Onboarding"
        description="Complete your institution representative profile"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Onboarding Progress</CardTitle>
            <Badge variant="outline">{Math.round(progress())}% Complete</Badge>
          </div>
          <Progress value={progress()} className="mt-4" />
        </CardHeader>
      </Card>

      <Tabs
        value={currentStep}
        onValueChange={(v) => setCurrentStep(v as Step)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Institution Details Step */}
        <TabsContent value="institution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution">
                  Accredited Institution <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={institutionData.accreditedInstitutionId}
                  onValueChange={(value) =>
                    setInstitutionData({
                      ...institutionData,
                      accreditedInstitutionId: value,
                    })
                  }
                >
                  <SelectTrigger id="institution">
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.flatMap((inst) => {
                      const id = inst.accreditedInstitutionsId?.toString().trim();
                      if (!id || id === "") return [];
                      return (
                        <SelectItem key={id} value={id}>
                          {inst.accreditedInstitutionName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleSpecificIdentifier">
                  Institution Registration Number{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roleSpecificIdentifier"
                  value={institutionData.roleSpecificIdentifier}
                  onChange={(e) =>
                    setInstitutionData({
                      ...institutionData,
                      roleSpecificIdentifier: e.target.value,
                    })
                  }
                  placeholder="INST-2025-001"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="department"
                    value={institutionData.department}
                    onChange={(e) =>
                      setInstitutionData({
                        ...institutionData,
                        department: e.target.value,
                      })
                    }
                    placeholder="e.g., Training & Certification"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    value={institutionData.jobTitle}
                    onChange={(e) =>
                      setInstitutionData({
                        ...institutionData,
                        jobTitle: e.target.value,
                      })
                    }
                    placeholder="e.g., Training Coordinator"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={institutionData.notes}
                  onChange={(e) =>
                    setInstitutionData({
                      ...institutionData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Details Step */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={contactData.phone}
                    onChange={(e) =>
                      setContactData({ ...contactData, phone: e.target.value })
                    }
                    placeholder="+234 XXX XXX XXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactData.email}
                    onChange={(e) =>
                      setContactData({ ...contactData, email: e.target.value })
                    }
                    placeholder="contact@institution.edu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Institution Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={contactData.address}
                  onChange={(e) =>
                    setContactData({ ...contactData, address: e.target.value })
                  }
                  placeholder="Enter institution address"
                  rows={3}
                  required
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Emergency Contact (Optional)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPerson">
                      Contact Person Name
                    </Label>
                    <Input
                      id="emergencyContactPerson"
                      value={contactData.emergencyContactPerson}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          emergencyContactPerson: e.target.value,
                        })
                      }
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={contactData.relationship}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          relationship: e.target.value,
                        })
                      }
                      placeholder="e.g., Colleague, Deputy Director"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">
                      Contact Phone Number
                    </Label>
                    <Input
                      id="emergencyContactNumber"
                      value={contactData.emergencyContactNumber}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          emergencyContactNumber: e.target.value,
                        })
                      }
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactAddress">
                      Contact Address
                    </Label>
                    <Input
                      id="emergencyContactAddress"
                      value={contactData.emergencyContactAddress}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          emergencyContactAddress: e.target.value,
                        })
                      }
                      placeholder="Address"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Step */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Institution Documents
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDocument}
                  disabled={documentTypes.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {documentTypes.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        No Document Types Available
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please contact your administrator to add document types
                        for institutions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {institutionDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="border rounded p-4 space-y-3 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Document #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Document Type</Label>
                      <Select
                        value={doc.documentTypesId}
                        onValueChange={(value) => {
                          const newDocs = [...institutionDocuments];
                          newDocs[index].documentTypesId = value;
                          setInstitutionDocuments(newDocs);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.flatMap((type) => {
                            const id = type.documentTypesId?.toString().trim();
                            if (!id || id === "") return [];
                            return (
                              <SelectItem key={id} value={id}>
                                {type.description}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Document Number</Label>
                      <Input
                        value={doc.documentNumber}
                        onChange={(e) => {
                          const newDocs = [...institutionDocuments];
                          newDocs[index].documentNumber = e.target.value;
                          setInstitutionDocuments(newDocs);
                        }}
                        placeholder="Document number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issuing Authority</Label>
                      <Input
                        value={doc.issuingAuthority}
                        onChange={(e) => {
                          const newDocs = [...institutionDocuments];
                          newDocs[index].issuingAuthority = e.target.value;
                          setInstitutionDocuments(newDocs);
                        }}
                        placeholder="Authority that issued this document"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={doc.issueDate}
                        onChange={(e) => {
                          const newDocs = [...institutionDocuments];
                          newDocs[index].issueDate = e.target.value;
                          setInstitutionDocuments(newDocs);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiry Date (Optional)</Label>
                      <Input
                        type="date"
                        value={doc.expiryDate}
                        onChange={(e) => {
                          const newDocs = [...institutionDocuments];
                          newDocs[index].expiryDate = e.target.value;
                          setInstitutionDocuments(newDocs);
                        }}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Upload File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newDocs = [...institutionDocuments];
                            newDocs[index].file = file;
                            setInstitutionDocuments(newDocs);
                          }
                        }}
                      />
                      {doc.file && (
                        <p className="text-sm text-muted-foreground">
                          {doc.file.name} (
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {institutionDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents added yet</p>
                  <p className="text-sm mt-1">
                    At least one document is required
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={nextStep}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Step */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Institution Details</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Institution:{" "}
                      </span>
                      <span>
                        {institutions.find(
                          (i) =>
                            i.accreditedInstitutionsId ===
                            institutionData.accreditedInstitutionId
                        )?.accreditedInstitutionName || "Not selected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Registration Number:{" "}
                      </span>
                      <span>{institutionData.roleSpecificIdentifier}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department: </span>
                      <span>{institutionData.department}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Job Title: </span>
                      <span>{institutionData.jobTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span>{contactData.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span>{contactData.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address: </span>
                      <span>{contactData.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Institution Documents:{" "}
                      </span>
                      <span>
                        {institutionDocuments.filter((d) => d.file).length}{" "}
                        file(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By submitting this form, you confirm that all information
                  provided is accurate and complete. Your application will be
                  reviewed by the maritime authority.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner className="mr-2" />
                    ) : null}
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit Onboarding
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

