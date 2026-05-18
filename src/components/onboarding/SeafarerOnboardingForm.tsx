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
  Loader2,
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
import { ApiError } from "@/lib/api-client";
import {
  getUserReadinessStatus,
  isUserReadyFromReadiness,
  getDashboardRoleFromReadiness,
} from "@/lib/services/user-readiness-service";
import { getDashboardRoute } from "@/lib/role-routing";
import { refreshSessionAfterOnboarding } from "@/lib/services/auth-session-service";
import { OnboardingErrorCodes } from "@/types/errors";
import {
  getDocumentTypes,
  getTrainingStatuses,
  type DocumentTypeDto,
  type TrainingStatusDto,
} from "@/lib/services/lookup-service";
import {
  getStcwStandards,
  type StcwStandardDto,
} from "@/lib/services/accreditation-service";
import {
  getOnboardingRequirementsByRole,
  normalizeRequirementKind,
  type OnboardingRequirementDto,
} from "@/lib/services/onboarding-requirements-service";
import { getShipByImo } from "@/lib/services/imo-ship-lookup-service";
import { getAllRanks, type RankDto } from "@/lib/services/ranks";
import {
  getVerificationStatus,
  type VerificationStatusResponse,
} from "@/lib/services/verification-service";
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

/** Predefined education certificates for dropdown (no free text) */
const CERTIFICATE_OBTAINED_OPTIONS = [
  "First School Leaving Certificate",
  "Junior Secondary School Certificate (JSSCE)",
  "Senior Secondary School Certificate (SSCE)",
  "WAEC (West African Examinations Council)",
  "NECO (National Examinations Council)",
  "GCE O-Level",
  "GCE A-Level",
  "NCE (Nigeria Certificate in Education)",
  "OND (Ordinary National Diploma)",
  "HND (Higher National Diploma)",
  "Bachelor's Degree",
  "Postgraduate Diploma",
  "Master's Degree",
  "PhD / Doctorate",
  "Trade Test / Technical Certificate",
  "Other",
] as const;

/** One upload slot per onboarding requirement (document types from requirement) */
interface RequirementDocumentSlot {
  onboardingRequirementId: string;
  description: string;
  requirementKind: 0 | 1;
  documentTypeIds: string[];
  documentTypes: { documentTypesId: string; description: string }[];
  documentTypesId: string;
  file: File | null;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

/** Calculate days between two ISO date strings (YYYY-MM-DD). Returns 0 if invalid or missing. */
function daysBetween(dateFrom: string, dateTo: string): number {
  if (!dateFrom || !dateTo) return 0;
  const a = new Date(dateFrom);
  const b = new Date(dateTo);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = b.getTime() - a.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
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
  const [isDraft, setIsDraft] = useState(false);

  // Dropdown data
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [stcwStandards, setStcwStandards] = useState<StcwStandardDto[]>([]);
  const [trainingStatuses, setTrainingStatuses] = useState<TrainingStatusDto[]>(
    []
  );
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Basic Information (SIN is generated after approval, not collected here)
  const [basicData, setBasicData] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    middleName: (user as any)?.middleName ?? "",
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
  /** Indices of voyage rows whose vessel name / flag were filled from IMO lookup (readonly) */
  const [voyageLookedUpFromApi, setVoyageLookedUpFromApi] = useState<Set<number>>(new Set());
  const [voyageImoLookupLoading, setVoyageImoLookupLoading] = useState<number | null>(null);

  // Profile Documents (used when no onboarding requirements from API)
  const [profileDocuments, setProfileDocuments] = useState<DocumentUpload[]>(
    []
  );

  // Onboarding requirements (from API) and one upload slot per requirement
  const [onboardingRequirements, setOnboardingRequirements] = useState<
    OnboardingRequirementDto[]
  >([]);
  const [requirementDocuments, setRequirementDocuments] = useState<
    RequirementDocumentSlot[]
  >([]);

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

  // Load dropdown data and onboarding requirements
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        const [
          docTypesRes,
          stcwRes,
          trainingStatusRes,
          ranksData,
          requirementsRes,
        ] = await Promise.all([
          getDocumentTypes(),
          getStcwStandards(),
          getTrainingStatuses(),
          getAllRanks(),
          getOnboardingRequirementsByRole("SEAFARER"),
        ]);

        if (docTypesRes.data) {
          setDocumentTypes(docTypesRes.data);
          // When no requirements from API: one upload slot per document type (legacy behavior)
          if (!requirementsRes?.data?.length) {
            setProfileDocuments((prev) => {
              const byType = new Map(
                prev.map((d) => [d.documentTypesId?.toString().trim() ?? "", d])
              );
              return docTypesRes.data!.map((t) => {
                const id = t.documentTypesId?.toString().trim();
                if (!id) return null;
                const existing = byType.get(id);
                return (
                  existing ?? {
                    documentTypesId: id,
                    file: null,
                    documentNumber: "",
                    issueDate: "",
                    expiryDate: "",
                    issuingAuthority: "",
                  }
                );
              }).filter((x): x is DocumentUpload => x !== null);
            });
          }
        }

        if (requirementsRes?.success && requirementsRes.data?.length) {
          setOnboardingRequirements(requirementsRes.data);
          setRequirementDocuments(
            requirementsRes.data.map((req) => {
              const typeIds = req.documentTypeIds ?? req.documentTypes?.map((dt) => dt.documentTypesId) ?? [];
              const types = req.documentTypes ?? [];
              const firstId = typeIds[0] ?? "";
              return {
                onboardingRequirementId: req.onboardingRequirementId,
                description: req.description,
                requirementKind: normalizeRequirementKind(req.requirementKind),
                documentTypeIds: typeIds,
                documentTypes: types,
                documentTypesId: firstId,
                file: null,
                documentNumber: "",
                issueDate: "",
                expiryDate: "",
                issuingAuthority: "",
              };
            })
          );
        }

        if (stcwRes.data) setStcwStandards(stcwRes.data);
        if (trainingStatusRes.data) setTrainingStatuses(trainingStatusRes.data);
        if (ranksData) setRanks(ranksData);
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
    setVoyageLookedUpFromApi((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const handleVoyageImoLookup = async (index: number) => {
    const voyage = voyageActivities[index];
    const imo = (voyage?.imoNumber ?? "").trim();
    if (!imo) {
      toast.error("Enter an IMO number first");
      return;
    }
    setVoyageImoLookupLoading(index);
    try {
      const ship = await getShipByImo(imo);
      if (!ship) {
        toast.error("Vessel not found for this IMO number");
        return;
      }
      const newVoyages = [...voyageActivities];
      newVoyages[index] = {
        ...newVoyages[index],
        vesselName: ship.shipName,
        flagState: ship.country ?? ship.flag ?? "",
      };
      setVoyageActivities(newVoyages);
      setVoyageLookedUpFromApi((prev) => new Set(prev).add(index));
      toast.success("Vessel details filled from registry");
    } catch {
      toast.error("Failed to look up vessel by IMO");
    } finally {
      setVoyageImoLookupLoading(null);
    }
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

  const updateProfileDocByType = (
    documentTypesId: string,
    patch: Partial<DocumentUpload>
  ) => {
    setProfileDocuments((prev) =>
      prev.map((d) =>
        d.documentTypesId === documentTypesId ? { ...d, ...patch } : d
      )
    );
  };

  const updateRequirementDocument = (
    onboardingRequirementId: string,
    patch: Partial<RequirementDocumentSlot>
  ) => {
    setRequirementDocuments((prev) =>
      prev.map((rd) =>
        rd.onboardingRequirementId === onboardingRequirementId
          ? { ...rd, ...patch }
          : rd
      )
    );
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
    try {
      setIsSubmitting(true);
      setIsDraft(saveAsDraft);

      const useRequirements = onboardingRequirements.length > 0;
      const profileDocsFromRequirements = useRequirements
        ? requirementDocuments.filter((rd) => rd.file && rd.documentTypesId)
        : [];
      const profileDocsFromSlots = useRequirements
        ? []
        : profileDocuments.filter((doc) => doc.file && doc.documentTypesId);

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

        if (useRequirements) {
          const compulsoryMissing = requirementDocuments.filter(
            (rd) => rd.requirementKind === 0 && !rd.file
          );
          if (compulsoryMissing.length) {
            toast.error(
              "Please upload required documents for: " +
                compulsoryMissing.map((r) => r.description).join(", ")
            );
            setCurrentStep("documents");
            return;
          }
          if (profileDocsFromRequirements.length === 0) {
            toast.error("Please upload at least one profile document");
            setCurrentStep("documents");
            return;
          }
        } else {
          if (profileDocsFromSlots.length === 0) {
            toast.error("Please upload at least one profile document");
            return;
          }
        }
      }

      // Prepare the request data
      const requestData: ComprehensiveOnboardingRequest = {
        role: "SEAFARER", // Required: Role must be SEAFARER for seafarer onboarding
        workspaceRoleId,
        saveAsDraft,
        rankId: basicData.rankId || undefined,
        notes: basicData.notes || undefined,
        contactDetails: contactData,
        educationDetails: educationDetails.filter(
          (edu) => edu.institution && edu.institution.trim() !== "",
        ),
        seafarerTrainings: seafarerTrainings.filter(
          (training) => training.institutionSTCWAccreditationId,
        ),
        voyageActivities: voyageActivities
          .filter(
            (voyage) => voyage.vesselName && voyage.vesselName.trim() !== "",
          )
          .map((voyage) => {
            const days = daysBetween(voyage.dateJoined, voyage.dateLeft);
            return {
              ...voyage,
              totalSeaTimeDays:
                days > 0 ? String(days) : voyage.totalSeaTimeDays,
            };
          }),
        profileDocuments: useRequirements
          ? profileDocsFromRequirements.map((rd) => ({
              documentTypesId: rd.documentTypesId,
              file: rd.file!,
              documentNumber:
                rd.documentNumber ||
                (isIdentityDocumentType(rd.documentTypesId, documentTypes) &&
                verifiedDocumentNumber
                  ? verifiedDocumentNumber
                  : rd.documentNumber),
              issueDate: rd.issueDate,
              expiryDate: rd.expiryDate,
              issuingAuthority: rd.issuingAuthority,
            }))
          : profileDocuments
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

        if (saveAsDraft) {
          toast.info("You can continue your onboarding later.");
        } else {
          await refreshSessionAfterOnboarding();
          // Re-fetch readiness; if backend already marks approved, hard redirect to dashboard so layout gets fresh status
          try {
            const readinessRes = await getUserReadinessStatus();
            if (
              readinessRes.success &&
              readinessRes.data &&
              isUserReadyFromReadiness(readinessRes.data)
            ) {
              const dashboardRole =
                getDashboardRoleFromReadiness(readinessRes.data) ?? "SEAFARER";
              window.location.href = getDashboardRoute(dashboardRole);
              return;
            }
          } catch {
            // Fall through to pending
          }
          router.push("/onboarding/status/pending");
        }
      } else {
        toast.error(response.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      if (
        error instanceof ApiError &&
        error.code === OnboardingErrorCodes.MISSING_ONBOARDING_DOCUMENTS
      ) {
        setCurrentStep("documents");
        toast.error(handleApiError(error));
      } else {
        toast.error(handleApiError(error));
      }
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
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">Name as on Valid ID / Passport</p>
                <p className="text-muted-foreground mt-1">
                  Enter your name exactly as it appears on your valid ID or international passport.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={basicData.firstName}
                    onChange={(e) =>
                      setBasicData({ ...basicData, firstName: e.target.value })
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={basicData.middleName}
                    onChange={(e) =>
                      setBasicData({ ...basicData, middleName: e.target.value })
                    }
                    placeholder="Middle name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={basicData.lastName}
                    onChange={(e) =>
                      setBasicData({ ...basicData, lastName: e.target.value })
                    }
                    placeholder="Last name"
                  />
                </div>
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
                      <Select
                        value={edu.certificateObtained || ""}
                        onValueChange={(value) => {
                          const newEdu = [...educationDetails];
                          newEdu[index].certificateObtained = value;
                          setEducationDetails(newEdu);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select certificate or degree" />
                        </SelectTrigger>
                        <SelectContent>
                          {CERTIFICATE_OBTAINED_OPTIONS.map((cert) => (
                            <SelectItem key={cert} value={cert}>
                              {cert}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  disabled={stcwStandards.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Training
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {stcwStandards.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        No STCW standards available
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        STCW training courses could not be loaded. Please try again later.
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
                          {stcwStandards
                            .filter((s) => s.stcwRef?.trim())
                            .map((standard) => {
                              const id = standard.stcwRef.trim();
                              const label = standard.competenceArea
                                ? `${standard.competenceArea}${standard.level ? ` (${standard.level})` : ""}`
                                : id;
                              return (
                                <SelectItem key={id} value={id}>
                                  {label}
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
                        readOnly={voyageLookedUpFromApi.has(index)}
                        className={voyageLookedUpFromApi.has(index) ? "bg-muted" : undefined}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>IMO Number</Label>
                      <div className="flex gap-2">
                        <Input
                          value={voyage.imoNumber}
                          onChange={(e) => {
                            const newVoyages = [...voyageActivities];
                            newVoyages[index].imoNumber = e.target.value;
                            setVoyageActivities(newVoyages);
                          }}
                          placeholder="IMO-9876543"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleVoyageImoLookup(index)}
                          disabled={!voyage.imoNumber?.trim() || voyageImoLookupLoading === index}
                        >
                          {voyageImoLookupLoading === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Look up"
                          )}
                        </Button>
                      </div>
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
                        readOnly={voyageLookedUpFromApi.has(index)}
                        className={voyageLookedUpFromApi.has(index) ? "bg-muted" : undefined}
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
                          const days = daysBetween(
                            newVoyages[index].dateJoined,
                            newVoyages[index].dateLeft
                          );
                          newVoyages[index].totalSeaTimeDays =
                            days > 0 ? String(days) : "";
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
                          const days = daysBetween(
                            newVoyages[index].dateJoined,
                            newVoyages[index].dateLeft
                          );
                          newVoyages[index].totalSeaTimeDays =
                            days > 0 ? String(days) : "";
                          setVoyageActivities(newVoyages);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Sea Time (Days)</Label>
                      <Input
                        type="text"
                        readOnly
                        className="bg-muted cursor-not-allowed"
                        value={
                          voyage.dateJoined && voyage.dateLeft
                            ? daysBetween(
                                voyage.dateJoined,
                                voyage.dateLeft
                              ).toString()
                            : ""
                        }
                        placeholder="Calculated from Date Joined and Date Left"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {onboardingRequirements.length > 0 ? (
                /* Requirement-based checklist from API */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold">
                      Required Documents{" "}
                      <span className="text-sm text-destructive">*</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload one document per requirement. Compulsory items must be satisfied before submit.
                    </p>
                  </div>
                  {requirementDocuments.map((rd) => {
                    const isRequired = rd.requirementKind === 0;
                    const isIdentity = isIdentityDocumentType(rd.documentTypesId, documentTypes);
                    const fileInputId = `file-req-${rd.onboardingRequirementId}`;
                    return (
                      <div key={rd.onboardingRequirementId} className="space-y-3 border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium">{rd.description}</h4>
                          <Badge variant={isRequired ? "destructive" : "secondary"}>
                            {isRequired ? "Required" : "Optional"}
                          </Badge>
                          {rd.documentTypes.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Acceptable: {rd.documentTypes.map((dt) => dt.description).join(" or ")}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Document Type</Label>
                            <Select
                              value={rd.documentTypesId || ""}
                              onValueChange={(value) =>
                                updateRequirementDocument(rd.onboardingRequirementId, {
                                  documentTypesId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {rd.documentTypes.map((dt) => (
                                  <SelectItem key={dt.documentTypesId} value={dt.documentTypesId}>
                                    {dt.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div
                          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 min-h-[120px] bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            (document.getElementById(fileInputId) as HTMLInputElement)?.click()
                          }
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add("border-primary/50");
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove("border-primary/50");
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("border-primary/50");
                            const file = e.dataTransfer.files?.[0];
                            if (file && /\.(pdf|jpg|jpeg|png)$/i.test(file.name)) {
                              updateRequirementDocument(rd.onboardingRequirementId, { file });
                            }
                          }}
                        >
                          <input
                            id={fileInputId}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                updateRequirementDocument(rd.onboardingRequirementId, { file });
                              e.target.value = "";
                            }}
                          />
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground text-center">
                            Drop file or click to upload
                          </p>
                          {rd.file && (
                            <p className="text-sm font-medium text-primary mt-1">{rd.file.name}</p>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 pt-2">
                          <div className="space-y-2">
                            <Label>Document Number</Label>
                            {isIdentity && verifiedDocumentNumber ? (
                              <Input
                                value={rd.documentNumber || verifiedDocumentNumber}
                                readOnly
                                className="bg-muted font-mono"
                              />
                            ) : (
                              <Input
                                value={rd.documentNumber}
                                onChange={(e) =>
                                  updateRequirementDocument(rd.onboardingRequirementId, {
                                    documentNumber: e.target.value,
                                  })
                                }
                                placeholder="Document number"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Issuing Authority</Label>
                            <Input
                              value={rd.issuingAuthority}
                              onChange={(e) =>
                                updateRequirementDocument(rd.onboardingRequirementId, {
                                  issuingAuthority: e.target.value,
                                })
                              }
                              placeholder="Issuing authority"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input
                              type="date"
                              value={rd.issueDate}
                              onChange={(e) =>
                                updateRequirementDocument(rd.onboardingRequirementId, {
                                  issueDate: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={rd.expiryDate}
                              onChange={(e) =>
                                updateRequirementDocument(rd.onboardingRequirementId, {
                                  expiryDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {requirementDocuments.filter((d) => d.file).length === 0 && (
                    <p className="text-sm text-destructive">
                      Upload at least one document for the requirements above. All compulsory items are required.
                    </p>
                  )}
                </div>
              ) : (
                /* Legacy: one upload per document type when no requirements from API */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold">
                      Required Documents{" "}
                      <span className="text-sm text-destructive">*</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload the correct document for each requirement. At least one document is required.
                    </p>
                  </div>
                  {documentTypes.map((type) => {
                    const id = type.documentTypesId?.toString().trim();
                    if (!id) return null;
                    const doc = profileDocuments.find((d) => d.documentTypesId === id);
                    if (!doc) return null;
                    const isIdentity = isIdentityDocumentType(id, documentTypes);
                    return (
                      <div key={id} className="space-y-3">
                        <h4 className="text-sm font-medium">
                          {type.description}{" "}
                          <span className="text-destructive">*</span>
                        </h4>
                        <div
                          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 min-h-[140px] bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            (document.getElementById(`file-${id}`) as HTMLInputElement)?.click()
                          }
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add("border-primary/50");
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove("border-primary/50");
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("border-primary/50");
                            const file = e.dataTransfer.files?.[0];
                            if (file && /\.(pdf|jpg|jpeg|png)$/i.test(file.name)) {
                              updateProfileDocByType(id, { file });
                            }
                          }}
                        >
                          <input
                            id={`file-${id}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) updateProfileDocByType(id, { file });
                              e.target.value = "";
                            }}
                          />
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground text-center">
                            Drop files here or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Select a single file to upload
                          </p>
                          {doc.file && (
                            <p className="text-sm font-medium text-primary mt-1">
                              {doc.file.name}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 pt-2">
                          <div className="space-y-2">
                            <Label>Document Number</Label>
                            {isIdentity && verifiedDocumentNumber ? (
                              <Input
                                value={doc.documentNumber || verifiedDocumentNumber}
                                readOnly
                                className="bg-muted font-mono"
                              />
                            ) : (
                              <Input
                                value={doc.documentNumber}
                                onChange={(e) =>
                                  updateProfileDocByType(id, {
                                    documentNumber: e.target.value,
                                  })
                                }
                                placeholder="Document number"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Issuing Authority</Label>
                            <Input
                              value={doc.issuingAuthority}
                              onChange={(e) =>
                                updateProfileDocByType(id, {
                                  issuingAuthority: e.target.value,
                                })
                              }
                              placeholder="Issuing authority"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input
                              type="date"
                              value={doc.issueDate}
                              onChange={(e) =>
                                updateProfileDocByType(id, { issueDate: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                              type="date"
                              value={doc.expiryDate}
                              onChange={(e) =>
                                updateProfileDocByType(id, { expiryDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {profileDocuments.filter((d) => d.file).length === 0 && (
                    <p className="text-sm text-destructive">
                      At least one document is required. Upload the correct file for each requirement above.
                    </p>
                  )}
                </div>
              )}

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
                        {[basicData.firstName, basicData.middleName, basicData.lastName]
                          .filter(Boolean)
                          .join(" ")}
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
                        {onboardingRequirements.length > 0
                          ? requirementDocuments.filter((d) => d.file).length
                          : profileDocuments.filter((d) => d.file).length}{" "}
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
