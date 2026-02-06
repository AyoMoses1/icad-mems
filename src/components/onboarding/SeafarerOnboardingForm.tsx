"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap,
  User,
  Trash2,
  Plus,
  Ship,
  Award,
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
  type EducationDetailsRequest,
  type SeafarerTrainingRequest,
  type VoyageActivityRequest,
} from "@/lib/services/comprehensive-onboarding-service";
import { handleApiError } from "@/lib/error-handler";
import {
  getDocumentTypes,
  getSTCWAccreditations,
  getTrainingStatuses,
  type DocumentTypeDto,
  type STCWAccreditationDto,
  type TrainingStatusDto,
} from "@/lib/services/lookup-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";
import {
  getVerificationStatus,
  type VerificationStatusResponse,
} from "@/lib/services/verification-service";
import { IdentityVerificationStep } from "./IdentityVerificationStep";

type Step =
  | "basic"
  | "contact"
  | "education"
  | "trainings"
  | "voyages"
  | "documents"
  | "review";

interface DocumentUpload {
  documentTypesId: string;
  file: File | null;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

interface EducationDocumentUpload extends DocumentUpload {
  educationIndex: number;
}

interface VoyageDocumentUpload extends DocumentUpload {
  voyageActivityIndex: number;
}

/** Check if document type is identity (Passport, National ID, etc.) */
function isIdentityDocumentType(
  documentTypesId: string,
  documentTypes: DocumentTypeDto[]
): boolean {
  const type = documentTypes.find(
    (t) => t.documentTypesId?.toString().trim() === documentTypesId
  );
  const desc = (type?.description || "").toLowerCase();
  return (
    desc.includes("passport") ||
    desc.includes("national id") ||
    desc.includes("international passport") ||
    desc.includes("id card") ||
    desc.includes("identity")
  );
}

interface SeafarerOnboardingFormProps {
  workspaceRoleId?: string;
}

export function SeafarerOnboardingForm({
  workspaceRoleId,
}: SeafarerOnboardingFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Dropdown data
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [stcwAccreditations, setSTCWAccreditations] = useState<
    STCWAccreditationDto[]
  >([]);
  const [trainingStatuses, setTrainingStatuses] = useState<TrainingStatusDto[]>(
    []
  );
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Basic Information
  const [basicData, setBasicData] = useState({
    sin: "",
    rankId: "",
    notes: "",
  });

  // Contact Details
  const [contactData, setContactData] = useState<ContactDetailsRequest>({
    phone: user?.phoneNumber || "",
    email: user?.email || "",
    address: (user as any)?.address
      ? `${(user as any).address.line1 || ""}${(user as any).address.line2 ? ", " + (user as any).address.line2 : ""}, ${(user as any).address.city || ""}, ${(user as any).address.state || ""}, ${(user as any).address.postalCode || ""}`
      : "",
    emergencyContactPerson: "",
    relationship: "",
    emergencyContactNumber: "",
    emergencyContactAddress: "",
  });

  // Education Details
  const [educationDetails, setEducationDetails] = useState<
    EducationDetailsRequest[]
  >([]);

  // Seafarer Trainings
  const [seafarerTrainings, setSeafarerTrainings] = useState<
    SeafarerTrainingRequest[]
  >([]);

  // Voyage Activities
  const [voyageActivities, setVoyageActivities] = useState<
    VoyageActivityRequest[]
  >([]);

  // Profile Documents
  const [profileDocuments, setProfileDocuments] = useState<DocumentUpload[]>(
    []
  );

  // Verified document number from Veriff identity verification
  const [verifiedDocumentNumber, setVerifiedDocumentNumber] = useState<
    string | null
  >(null);

  // Education Documents
  const [educationDocuments, setEducationDocuments] = useState<
    EducationDocumentUpload[]
  >([]);

  // Voyage Documents
  const [voyageDocuments, setVoyageDocuments] = useState<
    VoyageDocumentUpload[]
  >([]);

  // Fetch verified document number from identity verification
  useEffect(() => {
    if (!user?.id) return;
    const fetchVerifiedDoc = async () => {
      try {
        const res = await getVerificationStatus(user.id);
        if (
          res.success &&
          res.data?.isVerified &&
          res.data.latestVerification
        ) {
          const docNum =
            res.data.latestVerification.documentNumber ||
            res.data.latestVerification.idNumber;
          if (docNum) setVerifiedDocumentNumber(docNum);
        }
      } catch {
        // Ignore - verification may not be available
      }
    };
    fetchVerifiedDoc();
  }, [user?.id]);

  // Sync verified document number into identity docs when it loads
  useEffect(() => {
    if (!verifiedDocumentNumber) return;
    setProfileDocuments((prev) =>
      prev.map((doc) => {
        if (
          isIdentityDocumentType(doc.documentTypesId, documentTypes) &&
          !doc.documentNumber
        ) {
          return { ...doc, documentNumber: verifiedDocumentNumber };
        }
        return doc;
      })
    );
  }, [verifiedDocumentNumber, documentTypes]);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [docTypesRes, stcwRes, trainingStatusRes, ranksData] =
          await Promise.all([
            getDocumentTypes(),
            getSTCWAccreditations(),
            getTrainingStatuses(),
            getAllRanks(),
          ]);

        if (docTypesRes.data) {
          setDocumentTypes(docTypesRes.data);
        }
        if (stcwRes.data) {
          setSTCWAccreditations(stcwRes.data);
        }
        if (trainingStatusRes.data) {
          setTrainingStatuses(trainingStatusRes.data);
        }
        if (ranksData) {
          setRanks(ranksData);
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

  // Helper functions for managing arrays
  const handleAddEducation = () => {
    setEducationDetails([
      ...educationDetails,
      {
        index: educationDetails.length,
        institution: "",
        certificateObtained: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationDetails(educationDetails.filter((_, i) => i !== index));
    setEducationDetails((prev) =>
      prev.map((item, i) => ({ ...item, index: i }))
    );
    setEducationDocuments((prev) =>
      prev.filter((doc) => doc.educationIndex !== index)
    );
  };

  const handleAddTraining = () => {
    setSeafarerTrainings([
      ...seafarerTrainings,
      {
        institutionSTCWAccreditationId: "",
        startDate: "",
        endDate: "",
        trainingStatusId: "",
        result: "",
        certificateName: "",
        issueDate: "",
        expiryDate: "",
      },
    ]);
  };

  const handleRemoveTraining = (index: number) => {
    setSeafarerTrainings(seafarerTrainings.filter((_, i) => i !== index));
  };

  const handleAddVoyage = () => {
    setVoyageActivities([
      ...voyageActivities,
      {
        index: voyageActivities.length,
        seamanBookNo: "",
        vesselName: "",
        imoNumber: "",
        flagState: "",
        operatorCompany: "",
        portOfEngagement: "",
        portOfDischarge: "",
        dateJoined: "",
        dateLeft: "",
        totalSeaTimeDays: "",
        remarks: "",
      },
    ]);
  };

  const handleRemoveVoyage = (index: number) => {
    setVoyageActivities(voyageActivities.filter((_, i) => i !== index));
    setVoyageActivities((prev) =>
      prev.map((item, i) => ({ ...item, index: i }))
    );
    setVoyageDocuments((prev) =>
      prev.filter((doc) => doc.voyageActivityIndex !== index)
    );
  };

  const handleAddProfileDocument = () => {
    setProfileDocuments([
      ...profileDocuments,
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

  const handleRemoveProfileDocument = (index: number) => {
    setProfileDocuments(profileDocuments.filter((_, i) => i !== index));
  };

  const handleAddEducationDocument = () => {
    setEducationDocuments([
      ...educationDocuments,
      {
        educationIndex: 0,
        documentTypesId: "",
        file: null,
        documentNumber: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
      },
    ]);
  };

  const handleRemoveEducationDocument = (index: number) => {
    setEducationDocuments(educationDocuments.filter((_, i) => i !== index));
  };

  const handleAddVoyageDocument = () => {
    setVoyageDocuments([
      ...voyageDocuments,
      {
        voyageActivityIndex: 0,
        documentTypesId: "",
        file: null,
        documentNumber: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
      },
    ]);
  };

  const handleRemoveVoyageDocument = (index: number) => {
    setVoyageDocuments(voyageDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!saveAsDraft && !isIdentityVerified) {
      toast.error(
        "Please complete identity verification in the Documents step before submitting."
      );
      setCurrentStep("documents");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsDraft(saveAsDraft);

      // Validation for non-draft submissions
      if (!saveAsDraft) {
        if (!basicData.rankId) {
          toast.error("Please select your rank");
          setCurrentStep("basic");
          return;
        }

        if (!contactData.phone || !contactData.email || !contactData.address) {
          toast.error("Please fill in all required contact details");
          return;
        }

        if (profileDocuments.filter((doc) => doc.file).length === 0) {
          toast.error("Please upload at least one profile document");
          return;
        }
      }

      // Prepare the request data
      const requestData: ComprehensiveOnboardingRequest = {
        role: "SEAFARER", // Required: Role must be SEAFARER for seafarer onboarding
        workspaceRoleId,
        saveAsDraft,
        sin: basicData.sin || undefined,
        rankId: basicData.rankId || undefined,
        notes: basicData.notes || undefined,
        contactDetails: contactData,
        educationDetails: educationDetails.filter(
          (edu) => edu.institution && edu.institution.trim() !== ""
        ),
        seafarerTrainings: seafarerTrainings.filter(
          (training) => training.institutionSTCWAccreditationId
        ),
        voyageActivities: voyageActivities.filter(
          (voyage) => voyage.vesselName && voyage.vesselName.trim() !== ""
        ),
        profileDocuments: profileDocuments
          .filter((doc) => doc.file && doc.documentTypesId)
          .map((doc) => ({
            documentTypesId: doc.documentTypesId,
            file: doc.file!,
            documentNumber:
              doc.documentNumber ||
              (isIdentityDocumentType(doc.documentTypesId, documentTypes) &&
              verifiedDocumentNumber
                ? verifiedDocumentNumber
                : doc.documentNumber),
            issueDate: doc.issueDate,
            expiryDate: doc.expiryDate,
            issuingAuthority: doc.issuingAuthority,
          })),
        educationDocuments: educationDocuments
          .filter((doc) => doc.file && doc.documentTypesId)
          .map((doc) => ({
            educationIndex: doc.educationIndex,
            documentTypesId: doc.documentTypesId,
            file: doc.file!,
            documentNumber: doc.documentNumber,
            issueDate: doc.issueDate,
            expiryDate: doc.expiryDate,
            issuingAuthority: doc.issuingAuthority,
          })),
        voyageDocuments: voyageDocuments
          .filter((doc) => doc.file && doc.documentTypesId)
          .map((doc) => ({
            voyageActivityIndex: doc.voyageActivityIndex,
            documentTypesId: doc.documentTypesId,
            file: doc.file!,
            documentNumber: doc.documentNumber,
            issueDate: doc.issueDate,
            expiryDate: doc.expiryDate,
            issuingAuthority: doc.issuingAuthority,
          })),
      };

      const response = await submitComprehensiveOnboarding(requestData);

      if (response.success && response.data) {
        const { summary } = response.data;

        // Show warnings if any
        if (summary.warnings && summary.warnings.length > 0) {
          summary.warnings.forEach((warning) => {
            toast.warning(warning);
          });
        }

        toast.success(
          summary.message ||
            (saveAsDraft
              ? "Draft saved successfully!"
              : "Onboarding submitted successfully! Your application is now pending review.")
        );

        // After successful submission, the onboarding status is PENDING
        // Redirect to the pending status page to show the user their application is under review
        if (saveAsDraft) {
          // For drafts, stay on the page or redirect to a draft view
          // The user can continue editing later
          toast.info("You can continue your onboarding later.");
        } else {
          // For full submissions, redirect to pending status page
          router.push("/onboarding/status/pending");
        }
      } else {
        toast.error(response.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const progress = () => {
    const steps: Step[] = [
      "basic",
      "contact",
      "education",
      "trainings",
      "voyages",
      "documents",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const nextStep = () => {
    const steps: Step[] = [
      "basic",
      "contact",
      "education",
      "trainings",
      "voyages",
      "documents",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = [
      "basic",
      "contact",
      "education",
      "trainings",
      "voyages",
      "documents",
      "review",
    ];
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seafarer Onboarding"
        description="Complete your seafarer profile with all required information"
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="trainings">Trainings</TabsTrigger>
          <TabsTrigger value="voyages">Voyages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Basic Information Step */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={`${user?.firstName || ""} ${user?.middleName || ""} ${user?.lastName || ""}`.trim()}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank">
                  Rank <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={basicData.rankId}
                  onValueChange={(value) =>
                    setBasicData({ ...basicData, rankId: value })
                  }
                >
                  <SelectTrigger id="rank">
                    <SelectValue placeholder="Select your rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank.id} value={rank.id}>
                        {rank.title || rank.category || "Rank"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ranks.length === 0 && !isLoadingData && (
                  <p className="text-sm text-muted-foreground">
                    No ranks available. Please contact support.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sin">
                  Seafarer Identification Number (SIN)
                </Label>
                <Input
                  id="sin"
                  value={basicData.sin}
                  onChange={(e) =>
                    setBasicData({ ...basicData, sin: e.target.value })
                  }
                  placeholder="SIN-2025-XXX-XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={basicData.notes}
                  onChange={(e) =>
                    setBasicData({ ...basicData, notes: e.target.value })
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <p className="text-sm text-blue-800">
                  Your account information is pre-filled. Complete all steps to
                  submit your onboarding request.
                </p>
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
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Residential Address{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={contactData.address}
                  onChange={(e) =>
                    setContactData({ ...contactData, address: e.target.value })
                  }
                  placeholder="Enter your full address"
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
                      placeholder="e.g., Spouse, Parent, Sibling"
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

        {/* Education Details Step */}
        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education History
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddEducation}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {educationDetails.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Education Record #{index + 1}
                    </h3>
                    {educationDetails.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Institution Name</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...educationDetails];
                          newEdu[index].institution = e.target.value;
                          setEducationDetails(newEdu);
                        }}
                        placeholder="Name of institution"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Certificate Obtained</Label>
                      <Input
                        value={edu.certificateObtained}
                        onChange={(e) => {
                          const newEdu = [...educationDetails];
                          newEdu[index].certificateObtained = e.target.value;
                          setEducationDetails(newEdu);
                        }}
                        placeholder="Degree or certificate name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => {
                          const newEdu = [...educationDetails];
                          newEdu[index].startDate = e.target.value;
                          setEducationDetails(newEdu);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => {
                          const newEdu = [...educationDetails];
                          newEdu[index].endDate = e.target.value;
                          setEducationDetails(newEdu);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {educationDetails.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No education records added</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleAddEducation}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Education Record
                  </Button>
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

        {/* Seafarer Trainings Step */}
        <TabsContent value="trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  STCW Trainings & Certifications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTraining}
                  disabled={stcwAccreditations.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Training
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {stcwAccreditations.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        No STCW Accreditations Available
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please contact your administrator to add STCW
                        accreditations to the system before adding trainings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {seafarerTrainings.map((training, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Training #{index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTraining(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>STCW Training Course</Label>
                      <Select
                        value={training.institutionSTCWAccreditationId}
                        onValueChange={(value) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].institutionSTCWAccreditationId =
                            value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select STCW training" />
                        </SelectTrigger>
                        <SelectContent>
                          {stcwAccreditations.flatMap((stcw) => {
                            const id = stcw.institutionSTCWAccreditationId
                              ?.toString()
                              .trim();
                            if (!id || id === "") return [];
                            return (
                              <SelectItem key={id} value={id}>
                                {stcw.stcwRef} - {stcw.institutionName || ""}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={training.startDate}
                        onChange={(e) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].startDate = e.target.value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={training.endDate}
                        onChange={(e) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].endDate = e.target.value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Training Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={training.trainingStatusId}
                        onValueChange={(value) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].trainingStatusId = value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select training status" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainingStatuses.flatMap((status) => {
                            const id = status.trainingStatusId
                              ?.toString()
                              .trim();
                            if (!id || id === "") return [];
                            return (
                              <SelectItem key={id} value={id}>
                                {status.description}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Result</Label>
                      <Select
                        value={training.result}
                        onValueChange={(value) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].result = value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Certificate Name</Label>
                      <Input
                        value={training.certificateName}
                        onChange={(e) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].certificateName = e.target.value;
                          setSeafarerTrainings(newTrainings);
                        }}
                        placeholder="Certificate name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={training.issueDate}
                        onChange={(e) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].issueDate = e.target.value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={training.expiryDate}
                        onChange={(e) => {
                          const newTrainings = [...seafarerTrainings];
                          newTrainings[index].expiryDate = e.target.value;
                          setSeafarerTrainings(newTrainings);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

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

        {/* Voyages Step */}
        <TabsContent value="voyages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Voyage Activities & Sea Time
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddVoyage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Voyage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {voyageActivities.map((voyage, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Voyage #{index + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVoyage(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Seaman Book Number</Label>
                      <Input
                        value={voyage.seamanBookNo}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].seamanBookNo = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="SB-NGA-2021-00123"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Vessel Name</Label>
                      <Input
                        value={voyage.vesselName}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].vesselName = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="MV Atlantic Explorer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>IMO Number</Label>
                      <Input
                        value={voyage.imoNumber}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].imoNumber = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="IMO-9876543"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Flag State</Label>
                      <Input
                        value={voyage.flagState}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].flagState = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="Nigeria"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Operator Company</Label>
                      <Input
                        value={voyage.operatorCompany}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].operatorCompany = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="West African Shipping Lines"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Port of Engagement</Label>
                      <Input
                        value={voyage.portOfEngagement}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].portOfEngagement = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="Lagos, Nigeria"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Port of Discharge</Label>
                      <Input
                        value={voyage.portOfDischarge}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].portOfDischarge = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="Rotterdam, Netherlands"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date Joined</Label>
                      <Input
                        type="date"
                        value={voyage.dateJoined}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].dateJoined = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date Left</Label>
                      <Input
                        type="date"
                        value={voyage.dateLeft}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].dateLeft = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Sea Time (Days)</Label>
                      <Input
                        type="number"
                        value={voyage.totalSeaTimeDays}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].totalSeaTimeDays = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="188"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Remarks (Optional)</Label>
                      <Textarea
                        value={voyage.remarks}
                        onChange={(e) => {
                          const newVoyages = [...voyageActivities];
                          newVoyages[index].remarks = e.target.value;
                          setVoyageActivities(newVoyages);
                        }}
                        placeholder="Additional remarks..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {voyageActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No voyage activities added</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleAddVoyage}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Voyage
                  </Button>
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

        {/* Documents Step */}
        <TabsContent value="documents" className="space-y-4">
          {/* Identity Verification - verify before/after document details */}
          <IdentityVerificationStep
            userId={user?.id ?? ""}
            firstName={user?.firstName}
            lastName={user?.lastName}
            redirectToStatusPage
            onVerificationStatusChange={setIsIdentityVerified}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Identity & Professional Documents Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Identity & Professional Documents{" "}
                      <span className="text-sm text-destructive">
                        (Required - Min 1)
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your identification and professional certificates
                      (e.g., Passport, Seaman's Book, Certificates)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddProfileDocument}
                    disabled={documentTypes.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                </div>

                {profileDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="border rounded p-3 space-y-3 bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Document #{index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProfileDocument(index)}
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
                            const newDocs = [...profileDocuments];
                            newDocs[index].documentTypesId = value;
                            // Auto-fill document number for identity docs when verified
                            const type = documentTypes.find(
                              (t) =>
                                t.documentTypesId?.toString().trim() === value
                            );
                            const desc = (
                              type?.description || ""
                            ).toLowerCase();
                            const isIdentity =
                              desc.includes("passport") ||
                              desc.includes("national id") ||
                              desc.includes("international passport") ||
                              desc.includes("id card") ||
                              desc.includes("identity");
                            if (isIdentity && verifiedDocumentNumber) {
                              newDocs[index].documentNumber =
                                verifiedDocumentNumber;
                            }
                            setProfileDocuments(newDocs);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.flatMap((type) => {
                              const id = type.documentTypesId
                                ?.toString()
                                .trim();
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
                        <Label>
                          Document Number
                          {isIdentityDocumentType(
                            doc.documentTypesId,
                            documentTypes
                          ) &&
                            verifiedDocumentNumber && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs font-normal"
                              >
                                Verified
                              </Badge>
                            )}
                        </Label>
                        {isIdentityDocumentType(
                          doc.documentTypesId,
                          documentTypes
                        ) && verifiedDocumentNumber ? (
                          <div className="space-y-1">
                            <Input
                              value={
                                doc.documentNumber || verifiedDocumentNumber
                              }
                              readOnly
                              className="bg-muted font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                              Pre-filled from identity verification. This number
                              was verified via Veriff.
                            </p>
                          </div>
                        ) : (
                          <Input
                            value={doc.documentNumber}
                            onChange={(e) => {
                              const newDocs = [...profileDocuments];
                              newDocs[index].documentNumber = e.target.value;
                              setProfileDocuments(newDocs);
                            }}
                            placeholder={
                              isIdentityDocumentType(
                                doc.documentTypesId,
                                documentTypes
                              ) && !verifiedDocumentNumber
                                ? "Complete identity verification first to auto-fill"
                                : "Document number"
                            }
                          />
                        )}
                        {isIdentityDocumentType(
                          doc.documentTypesId,
                          documentTypes
                        ) &&
                          !verifiedDocumentNumber && (
                            <p className="text-xs text-amber-600 dark:text-amber-500">
                              Complete the Identity verification step first to
                              auto-fill this from your verified document.
                            </p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label>Issuing Authority</Label>
                        <Input
                          value={doc.issuingAuthority}
                          onChange={(e) => {
                            const newDocs = [...profileDocuments];
                            newDocs[index].issuingAuthority = e.target.value;
                            setProfileDocuments(newDocs);
                          }}
                          placeholder="Issuing authority"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input
                          type="date"
                          value={doc.issueDate}
                          onChange={(e) => {
                            const newDocs = [...profileDocuments];
                            newDocs[index].issueDate = e.target.value;
                            setProfileDocuments(newDocs);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={doc.expiryDate}
                          onChange={(e) => {
                            const newDocs = [...profileDocuments];
                            newDocs[index].expiryDate = e.target.value;
                            setProfileDocuments(newDocs);
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
                              const newDocs = [...profileDocuments];
                              newDocs[index].file = file;
                              setProfileDocuments(newDocs);
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

                {profileDocuments.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <p>No documents added yet</p>
                    <p className="text-xs mt-1 text-destructive">
                      At least one identity or professional document is required
                    </p>
                  </div>
                )}
              </div>

              {/* Education Documents Section */}
              {educationDetails.length > 0 && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Education Documents (Optional)
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload documents related to your education records
                        (e.g., Certificates, Diplomas, Transcripts)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEducationDocument}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Document
                    </Button>
                  </div>

                  {educationDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="border rounded p-3 space-y-3 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Education Document #{index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEducationDocument(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Linked to Education Record</Label>
                          <Select
                            value={doc.educationIndex.toString()}
                            onValueChange={(value) => {
                              const newDocs = [...educationDocuments];
                              newDocs[index].educationIndex = parseInt(value);
                              setEducationDocuments(newDocs);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {educationDetails.map((edu, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  {edu.institution || `Education #${idx + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Document Type</Label>
                          <Select
                            value={doc.documentTypesId}
                            onValueChange={(value) => {
                              const newDocs = [...educationDocuments];
                              newDocs[index].documentTypesId = value;
                              setEducationDocuments(newDocs);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.flatMap((type) => {
                                const id = type.documentTypesId
                                  ?.toString()
                                  .trim();
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

                        <div className="space-y-2 md:col-span-2">
                          <Label>Upload File</Label>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const newDocs = [...educationDocuments];
                                newDocs[index].file = file;
                                setEducationDocuments(newDocs);
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

                  {educationDocuments.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No documents added yet for your education records</p>
                      <p className="text-xs mt-1">
                        Link documents to the education records you added
                        earlier
                      </p>
                    </div>
                  )}
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
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name: </span>
                      <span>
                        {`${user?.firstName || ""} ${user?.middleName || ""} ${user?.lastName || ""}`.trim()}
                      </span>
                    </div>
                    {basicData.rankId && (
                      <div>
                        <span className="text-muted-foreground">Rank: </span>
                        <span>
                          {ranks.find((r) => r.id === basicData.rankId)
                            ?.title ||
                            ranks.find((r) => r.id === basicData.rankId)
                              ?.category ||
                            "N/A"}
                        </span>
                      </div>
                    )}
                    {basicData.sin && (
                      <div>
                        <span className="text-muted-foreground">SIN: </span>
                        <span>{basicData.sin}</span>
                      </div>
                    )}
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
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Education Records:{" "}
                      </span>
                      <span>
                        {educationDetails.filter((e) => e.institution).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trainings: </span>
                      <span>
                        {
                          seafarerTrainings.filter(
                            (t) => t.institutionSTCWAccreditationId
                          ).length
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Voyages: </span>
                      <span>
                        {voyageActivities.filter((v) => v.vesselName).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Profile Documents:{" "}
                      </span>
                      <span>
                        {profileDocuments.filter((d) => d.file).length} file(s)
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
                    {isSubmitting && isDraft ? (
                      <LoadingSpinner className="mr-2" />
                    ) : null}
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    {isSubmitting && !isDraft ? (
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
