"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Building2,
  Shield,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Ship,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getOnboardingById,
  updateOnboardingStatus,
  getSeafarerIdentificationNumber,
  type UserSeafarerOnboardingDto,
  OnboardingStatus,
} from "@/lib/services/onboarding-service";
import { getApiBaseUrl } from "@/lib/api-client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SEAFARER: <User className="h-4 w-4" />,
  TRAINING_INSTITUTION: <Building2 className="h-4 w-4" />,
  AGENT: <Building2 className="h-4 w-4" />,
  ADMIN: <Shield className="h-4 w-4" />,
  OFFICER: <Shield className="h-4 w-4" />,
  INSPECTOR: <Shield className="h-4 w-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  SEAFARER: "bg-blue-100 text-blue-800",
  TRAINING_INSTITUTION: "bg-purple-100 text-purple-800",
  AGENT: "bg-indigo-100 text-indigo-800",
  ADMIN: "bg-red-100 text-red-800",
  OFFICER: "bg-orange-100 text-orange-800",
  INSPECTOR: "bg-teal-100 text-teal-800",
};

type OnboardingDto = UserSeafarerOnboardingDto & {
  id: string;
  status: string;
  role: string;
};

export default function OnboardingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<OnboardingDto | null>(null);

  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | "SUSPENDED">("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [seafarerIdNumber, setSeafarerIdNumber] = useState("");
  const [isLoadingSin, setIsLoadingSin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOnboarding();
  }, [id]);

  const loadOnboarding = async () => {
    try {
      setIsLoading(true);
      const response = await getOnboardingById(id);
      if (response.success && response.data) {
        const data = {
          ...response.data,
          id: response.data.userSeafarerOnboardingId || response.data.id || "",
        } as OnboardingDto;
        setOnboarding(data);
      } else {
        toast.error("Failed to load onboarding details");
        router.push("/admin/onboarding");
      }
    } catch (error) {
      console.error("Failed to load onboarding:", error);
      toast.error("Failed to load onboarding details");
      router.push("/admin/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewOnboarding = async () => {
    if (!onboarding) return;

    if (reviewAction === "REJECTED" && !reviewNotes.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateOnboardingStatus(onboarding.id, {
        status: reviewAction as OnboardingStatus,
        rn: reviewAction === "APPROVED" ? onboarding.rn ?? undefined : undefined,
        rejectionReason: reviewAction === "REJECTED" ? reviewNotes : undefined,
        notes: reviewNotes || undefined,
      });

      if (response.success) {
        toast.success(`Onboarding ${reviewAction.toLowerCase()} successfully`);
        setIsReviewDialogOpen(false);
        setReviewNotes("");
        setSeafarerIdNumber("");
        loadOnboarding(); // Reload to get updated data
      } else {
        toast.error(response.message || "Failed to update onboarding");
      }
    } catch (error) {
      console.error("Failed to update onboarding:", error);
      toast.error("Failed to update onboarding status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewDialog = async (action: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    setReviewAction(action);
    setReviewNotes("");
    setSeafarerIdNumber(onboarding?.sin ?? "");
    setIsReviewDialogOpen(true);
    if (action === "APPROVED" && id) {
      setIsLoadingSin(true);
      try {
        const res = await getSeafarerIdentificationNumber(id);
        if (res.success && res.data?.sin) setSeafarerIdNumber(res.data.sin);
      } catch {
        // Keep existing onboarding.sin if any
      } finally {
        setIsLoadingSin(false);
      }
    }
  };

  const handleDownloadDocument = (filePathOrUrl: string | null | undefined) => {
    if (!filePathOrUrl?.trim()) return;
    const baseUrl = getApiBaseUrl();
    const fullUrl = filePathOrUrl.startsWith("http")
      ? filePathOrUrl
      : `${baseUrl}${filePathOrUrl.startsWith("/") ? "" : "/"}${filePathOrUrl}`;
    window.open(fullUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Onboarding not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/onboarding")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <PageHeader
              title="Onboarding Application Details"
              description={`Review complete application for ${onboarding.role}`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onboarding.status === "PENDING" && (
            <>
              <Button
                variant="outline"
                className="text-green-600"
                onClick={() => openReviewDialog("APPROVED")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => openReviewDialog("REJECTED")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {onboarding.status === "APPROVED" && (
            <Button
              variant="outline"
              className="text-yellow-600"
              onClick={() => openReviewDialog("SUSPENDED")}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVED" ? "Approve" : reviewAction === "REJECTED" ? "Reject" : "Suspend"} Onboarding
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "APPROVED"
                ? "Approve this onboarding request and assign a registration number"
                : "Provide a reason for this decision"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {onboarding && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_COLORS[onboarding.role] || "bg-gray-100"}>
                    {ROLE_ICONS[onboarding.role]}
                    <span className="ml-1">{onboarding.role}</span>
                  </Badge>
                </div>
              </div>
            )}
            {reviewAction === "APPROVED" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rn">Registration Number (RN)</Label>
                  <Input
                    id="rn"
                    value={onboarding?.rn ?? ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sin">Seafarer Identification Number (SIN)</Label>
                  <Input
                    id="sin"
                    placeholder={isLoadingSin ? "Loading..." : "—"}
                    value={seafarerIdNumber}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {reviewAction === "REJECTED" ? "Rejection Reason *" : "Notes"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  reviewAction === "REJECTED"
                    ? "Please provide a reason for rejection..."
                    : "Add any notes or comments..."
                }
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                required={reviewAction === "REJECTED"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReviewOnboarding}
              disabled={isSubmitting || (reviewAction === "REJECTED" && !reviewNotes.trim())}
              className={
                reviewAction === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : reviewAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {isSubmitting
                ? "Processing..."
                : reviewAction === "APPROVED"
                ? "Approve"
                : reviewAction === "REJECTED"
                ? "Reject"
                : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          {/* Always show Training tab for SEAFARER role */}
          {(onboarding.role === "SEAFARER" || onboarding.seafarerTrainings?.length) && (
            <TabsTrigger value="training">
              Training
              {(() => {
                const count = typeof onboarding.seafarerTrainingCount === 'number' 
                  ? onboarding.seafarerTrainingCount 
                  : parseInt(String(onboarding.seafarerTrainingCount || '0'), 10);
                return count > 0 ? ` (${count})` : '';
              })()}
            </TabsTrigger>
          )}
          {/* Always show Voyages tab for SEAFARER role */}
          {(onboarding.role === "SEAFARER" || onboarding.voyageActivities?.length) && (
            <TabsTrigger value="voyages">
              Voyages
              {(() => {
                const count = typeof onboarding.voyageActivityCount === 'number' 
                  ? onboarding.voyageActivityCount 
                  : parseInt(String(onboarding.voyageActivityCount || '0'), 10);
                return count > 0 ? ` (${count})` : '';
              })()}
            </TabsTrigger>
          )}
          {/* Always show Profile Documents tab for SEAFARER role */}
          {(onboarding.role === "SEAFARER" || onboarding.profileDocuments?.length) && (
            <TabsTrigger value="profile">
              Profile Documents
              {(() => {
                const count = typeof onboarding.profileDocumentCount === 'number' 
                  ? onboarding.profileDocumentCount 
                  : parseInt(String(onboarding.profileDocumentCount || '0'), 10);
                return count > 0 ? ` (${count})` : '';
              })()}
            </TabsTrigger>
          )}
          {/* Show Institution Documents tab for AGENT and TRAINING_INSTITUTION roles */}
          {(onboarding.role === "AGENT" || onboarding.role === "TRAINING_INSTITUTION" || onboarding.institutionDocuments?.length) && (
            <TabsTrigger value="institution-docs">
              Institution Documents
              {(() => {
                const count = typeof onboarding.institutionDocumentCount === 'number' 
                  ? onboarding.institutionDocumentCount 
                  : parseInt(String(onboarding.institutionDocumentCount || '0'), 10);
                return count > 0 ? ` (${count})` : '';
              })()}
            </TabsTrigger>
          )}
          <TabsTrigger value="documents">All Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={ROLE_COLORS[onboarding.role] || "bg-gray-100"}>
                      {ROLE_ICONS[onboarding.role]}
                      <span className="ml-1">{onboarding.role}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={STATUS_COLORS[onboarding.status]}>
                      {onboarding.status}
                    </Badge>
                  </div>
                </div>
                {onboarding.sin && (
                  <div>
                    <Label className="text-muted-foreground">SIN</Label>
                    <p className="font-medium mt-1">{onboarding.sin}</p>
                  </div>
                )}
                {onboarding.rn && (
                  <div>
                    <Label className="text-muted-foreground">Registration Number (RN)</Label>
                    <p className="font-medium text-green-600 mt-1">{onboarding.rn}</p>
                  </div>
                )}
                {onboarding.userId && (
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono text-sm mt-1">{onboarding.userId}</p>
                  </div>
                )}
                {onboarding.dateCreated && (
                  <div>
                    <Label className="text-muted-foreground">Date Created</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{format(new Date(onboarding.dateCreated), "PPP")}</p>
                    </div>
                  </div>
                )}
                {onboarding.dateModified && (
                  <div>
                    <Label className="text-muted-foreground">Last Modified</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{format(new Date(onboarding.dateModified), "PPP")}</p>
                    </div>
                  </div>
                )}
                {onboarding.approvedDate && (
                  <div>
                    <Label className="text-muted-foreground">Approved Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{format(new Date(onboarding.approvedDate), "PPP")}</p>
                    </div>
                  </div>
                )}
                {onboarding.approvedBy && (
                  <div>
                    <Label className="text-muted-foreground">Approved By</Label>
                    <p className="mt-1">{onboarding.approvedBy}</p>
                  </div>
                )}
                {onboarding.accreditedInstitutionName && (
                  <div>
                    <Label className="text-muted-foreground">Accredited Institution</Label>
                    <p className="font-medium mt-1">{onboarding.accreditedInstitutionName}</p>
                  </div>
                )}
                {onboarding.roleSpecificIdentifier && (
                  <div>
                    <Label className="text-muted-foreground">Role Specific Identifier</Label>
                    <p className="font-medium mt-1">{onboarding.roleSpecificIdentifier}</p>
                  </div>
                )}
                {onboarding.department && (
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="mt-1">{onboarding.department}</p>
                  </div>
                )}
                {onboarding.jobTitle && (
                  <div>
                    <Label className="text-muted-foreground">Job Title</Label>
                    <p className="mt-1">{onboarding.jobTitle}</p>
                  </div>
                )}
                {onboarding.employeeId && (
                  <div>
                    <Label className="text-muted-foreground">Employee ID</Label>
                    <p className="mt-1">{onboarding.employeeId}</p>
                  </div>
                )}
                {(onboarding.isOnboardingComplete !== undefined) && (
                  <div>
                    <Label className="text-muted-foreground">Onboarding Complete</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={onboarding.isOnboardingComplete ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {onboarding.isOnboardingComplete ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              {onboarding.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-2 text-sm bg-muted p-3 rounded-lg">{onboarding.notes}</p>
                  </div>
                </>
              )}
              {onboarding.rejectionReason && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-red-600">Rejection Reason</Label>
                    <p className="mt-2 text-sm bg-red-50 p-3 rounded-lg text-red-900">{onboarding.rejectionReason}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          {onboarding.contactDetails ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {onboarding.contactDetails.phone && (
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{onboarding.contactDetails.phone}</p>
                      </div>
                    </div>
                  )}
                  {onboarding.contactDetails.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{onboarding.contactDetails.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                {onboarding.contactDetails.address && (
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <p>{onboarding.contactDetails.address}</p>
                    </div>
                  </div>
                )}
                <Separator />
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Emergency Contact</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {onboarding.contactDetails.emergencyContactPerson && (
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="mt-1">{onboarding.contactDetails.emergencyContactPerson}</p>
                      </div>
                    )}
                    {onboarding.contactDetails.relationship && (
                      <div>
                        <Label className="text-muted-foreground">Relationship</Label>
                        <p className="mt-1">{onboarding.contactDetails.relationship}</p>
                      </div>
                    )}
                    {onboarding.contactDetails.emergencyContactNumber && (
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p>{onboarding.contactDetails.emergencyContactNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {onboarding.contactDetails.emergencyContactAddress && (
                    <div>
                      <Label className="text-muted-foreground">Emergency Contact Address</Label>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <p>{onboarding.contactDetails.emergencyContactAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contact information provided</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          {onboarding.educationDetails && onboarding.educationDetails.length > 0 ? (
            onboarding.educationDetails.map((edu: any, index: number) => (
              <Card key={edu.educationId || index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education Record {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {edu.institution && (
                      <div>
                        <Label className="text-muted-foreground">Institution</Label>
                        <p className="font-medium mt-1">{edu.institution}</p>
                      </div>
                    )}
                    {edu.certificateObtained && (
                      <div>
                        <Label className="text-muted-foreground">Certificate Obtained</Label>
                        <p className="font-medium mt-1">{edu.certificateObtained}</p>
                      </div>
                    )}
                    {edu.startDate && (
                      <div>
                        <Label className="text-muted-foreground">Start Date</Label>
                        <p className="mt-1">{format(new Date(edu.startDate), "PPP")}</p>
                      </div>
                    )}
                    {edu.endDate && (
                      <div>
                        <Label className="text-muted-foreground">End Date</Label>
                        <p className="mt-1">{format(new Date(edu.endDate), "PPP")}</p>
                      </div>
                    )}
                  </div>
                  {edu.documents && edu.documents.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Documents ({edu.documents.length})</Label>
                        <div className="space-y-2">
                          {edu.documents.map((doc: any) => (
                            <div
                              key={doc.documentId}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="font-medium text-sm">
                                    {doc.documentTypeDescription || "Document"}
                                  </p>
                                  {doc.issueDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Issued: {format(new Date(doc.issueDate), "PP")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!doc.filePathOrUrl?.trim()}
                                onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No education details provided</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Training Records Tab - Always show for SEAFARER */}
        {(onboarding.role === "SEAFARER" || onboarding.seafarerTrainings?.length) && (
          <TabsContent value="training" className="space-y-4">
            {onboarding.seafarerTrainings && onboarding.seafarerTrainings.length > 0 ? (
              onboarding.seafarerTrainings.map((training: any, index: number) => (
                <Card key={training.recordId || training.trainingId || index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      {training.certificateName || `Training ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {training.institutionSTCWAccreditationName && (
                        <div>
                          <Label className="text-muted-foreground">Institution</Label>
                          <p className="font-medium mt-1">{training.institutionSTCWAccreditationName}</p>
                        </div>
                      )}
                      {training.institutionName && (
                        <div>
                          <Label className="text-muted-foreground">Institution Name</Label>
                          <p className="font-medium mt-1">{training.institutionName}</p>
                        </div>
                      )}
                      {training.trainingStatusDescription && (
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <p className="mt-1">{training.trainingStatusDescription}</p>
                        </div>
                      )}
                      {training.certificateName && (
                        <div>
                          <Label className="text-muted-foreground">Certificate Name</Label>
                          <p className="font-medium mt-1">{training.certificateName}</p>
                        </div>
                      )}
                      {training.startDate && (
                        <div>
                          <Label className="text-muted-foreground">Start Date</Label>
                          <p className="mt-1">{format(new Date(training.startDate), "PPP")}</p>
                        </div>
                      )}
                      {training.endDate && (
                        <div>
                          <Label className="text-muted-foreground">End Date</Label>
                          <p className="mt-1">{format(new Date(training.endDate), "PPP")}</p>
                        </div>
                      )}
                      {training.result && (
                        <div>
                          <Label className="text-muted-foreground">Result</Label>
                          <p className="mt-1">{training.result}</p>
                        </div>
                      )}
                      {training.issueDate && (
                        <div>
                          <Label className="text-muted-foreground">Certificate Issue Date</Label>
                          <p className="mt-1">{format(new Date(training.issueDate), "PPP")}</p>
                        </div>
                      )}
                      {training.expiryDate && (
                        <div>
                          <Label className="text-muted-foreground">Certificate Expiry Date</Label>
                          <p className="mt-1">{format(new Date(training.expiryDate), "PPP")}</p>
                        </div>
                      )}
                    </div>
                    {training.documents && training.documents.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground mb-2 block">Documents ({training.documents.length})</Label>
                          <div className="space-y-2">
                            {training.documents.map((doc: any) => (
                              <div
                                key={doc.documentId}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {doc.documentTypeDescription || "Document"}
                                    </p>
                                    {doc.issueDate && (
                                      <p className="text-xs text-muted-foreground">
                                        Issued: {format(new Date(doc.issueDate), "PP")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!doc.filePathOrUrl?.trim()}
                                  onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No training records</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Voyage Activities Tab - Always show for SEAFARER */}
        {(onboarding.role === "SEAFARER" || onboarding.voyageActivities?.length) && (
          <TabsContent value="voyages" className="space-y-4">
            {onboarding.voyageActivities && onboarding.voyageActivities.length > 0 ? (
              onboarding.voyageActivities.map((voyage: any, index: number) => (
                <Card key={voyage.voyageActivityId || voyage.logId || index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ship className="h-5 w-5" />
                      {voyage.vesselName || `Voyage ${index + 1}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {voyage.vesselName && (
                        <div>
                          <Label className="text-muted-foreground">Vessel Name</Label>
                          <p className="font-medium mt-1">{voyage.vesselName}</p>
                        </div>
                      )}
                      {voyage.seamanBookNo && (
                        <div>
                          <Label className="text-muted-foreground">Seaman Book No</Label>
                          <p className="font-medium mt-1">{voyage.seamanBookNo}</p>
                        </div>
                      )}
                      {voyage.imoNumber && (
                        <div>
                          <Label className="text-muted-foreground">IMO Number</Label>
                          <p className="font-medium mt-1">{voyage.imoNumber}</p>
                        </div>
                      )}
                      {voyage.flagState && (
                        <div>
                          <Label className="text-muted-foreground">Flag State</Label>
                          <p className="mt-1">{voyage.flagState}</p>
                        </div>
                      )}
                      {voyage.operatorCompany && (
                        <div>
                          <Label className="text-muted-foreground">Operator Company</Label>
                          <p className="mt-1">{voyage.operatorCompany}</p>
                        </div>
                      )}
                      {voyage.portOfEngagement && (
                        <div>
                          <Label className="text-muted-foreground">Port of Engagement</Label>
                          <p className="mt-1">{voyage.portOfEngagement}</p>
                        </div>
                      )}
                      {voyage.portOfDischarge && (
                        <div>
                          <Label className="text-muted-foreground">Port of Discharge</Label>
                          <p className="mt-1">{voyage.portOfDischarge}</p>
                        </div>
                      )}
                      {voyage.dateJoined && (
                        <div>
                          <Label className="text-muted-foreground">Date Joined</Label>
                          <p className="mt-1">{format(new Date(voyage.dateJoined), "PPP")}</p>
                        </div>
                      )}
                      {voyage.dateLeft && (
                        <div>
                          <Label className="text-muted-foreground">Date Left</Label>
                          <p className="mt-1">{format(new Date(voyage.dateLeft), "PPP")}</p>
                        </div>
                      )}
                      {voyage.totalSeaTimeDays != null && (
                        <div>
                          <Label className="text-muted-foreground">Total Sea Time</Label>
                          <p className="font-medium mt-1">{voyage.totalSeaTimeDays} days</p>
                        </div>
                      )}
                      {voyage.remarks && (
                        <div className="col-span-2">
                          <Label className="text-muted-foreground">Remarks</Label>
                          <p className="mt-1">{voyage.remarks}</p>
                        </div>
                      )}
                    </div>
                    {voyage.documents && voyage.documents.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground mb-2 block">Documents ({voyage.documents.length})</Label>
                          <div className="space-y-2">
                            {voyage.documents.map((doc: any) => (
                              <div
                                key={doc.documentId}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {doc.documentTypeDescription || "Document"}
                                    </p>
                                    {doc.issueDate && (
                                      <p className="text-xs text-muted-foreground">
                                        Issued: {format(new Date(doc.issueDate), "PP")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!doc.filePathOrUrl?.trim()}
                                  onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No voyage activities</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Profile Documents Tab - Always show for SEAFARER */}
        {(onboarding.role === "SEAFARER" || onboarding.profileDocuments?.length) && (
          <TabsContent value="profile" className="space-y-4">
            {onboarding.profileDocuments && onboarding.profileDocuments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Documents</CardTitle>
                  <CardDescription>
                    {onboarding.profileDocumentCount ?? onboarding.profileDocuments.length} document(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {onboarding.profileDocuments.map((doc: any) => (
                      <div
                        key={doc.documentId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {doc.documentTypeDescription || "Document"}
                            </p>
                            {doc.documentNumber && (
                              <p className="text-xs text-muted-foreground">
                                No. {doc.documentNumber}
                              </p>
                            )}
                            {(doc.issueDate || doc.expiryDate) && (
                              <p className="text-xs text-muted-foreground">
                                {doc.issueDate && `Issued: ${format(new Date(doc.issueDate), "PP")}`}
                                {doc.issueDate && doc.expiryDate && " · "}
                                {doc.expiryDate && `Expires: ${format(new Date(doc.expiryDate), "PP")}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!doc.filePathOrUrl?.trim()}
                          onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No profile documents</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Institution Documents Tab - For AGENT and TRAINING_INSTITUTION */}
        {(onboarding.role === "AGENT" || onboarding.role === "TRAINING_INSTITUTION" || onboarding.institutionDocuments?.length) && (
          <TabsContent value="institution-docs" className="space-y-4">
            {onboarding.institutionDocuments && onboarding.institutionDocuments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Institution Documents</CardTitle>
                  <CardDescription>
                    {onboarding.institutionDocumentCount ?? onboarding.institutionDocuments.length} document(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {onboarding.institutionDocuments.map((doc: any) => (
                      <div
                        key={doc.documentId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {doc.documentTypeDescription || "Institution Document"}
                            </p>
                            {doc.documentNumber && (
                              <p className="text-xs text-muted-foreground">
                                No. {doc.documentNumber}
                              </p>
                            )}
                            {doc.issuingAuthority && (
                              <p className="text-xs text-muted-foreground">
                                Issuing Authority: {doc.issuingAuthority}
                              </p>
                            )}
                            {(doc.issueDate || doc.expiryDate) && (
                              <p className="text-xs text-muted-foreground">
                                {doc.issueDate && `Issued: ${format(new Date(doc.issueDate), "PP")}`}
                                {doc.issueDate && doc.expiryDate && " · "}
                                {doc.expiryDate && `Expires: ${format(new Date(doc.expiryDate), "PP")}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!doc.filePathOrUrl?.trim()}
                          onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No institution documents uploaded</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Documents Tab - All Documents Summary */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Documents</CardTitle>
              <CardDescription>
                Complete list of all uploaded documents across all sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Education Documents */}
              {onboarding.hasEducationDetails && onboarding.educationDetails && onboarding.educationDetails.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block font-semibold">
                    Education Documents ({onboarding.educationDocumentCount ?? 0})
                  </Label>
                  <div className="space-y-2">
                    {onboarding.educationDetails.map((edu: any) =>
                      edu.documents?.map((doc: any) => (
                        <div
                          key={doc.documentId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">
                                {doc.documentTypeDescription || "Education Document"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Institution: {edu.institution || "N/A"}
                              </p>
                              {doc.documentNumber && (
                                <p className="text-xs text-muted-foreground">
                                  Document No: {doc.documentNumber}
                                </p>
                              )}
                              {doc.issueDate && (
                                <p className="text-xs text-muted-foreground">
                                  Issued: {format(new Date(doc.issueDate), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!doc.filePathOrUrl?.trim()}
                            onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Training Documents */}
              {onboarding.seafarerTrainings && onboarding.seafarerTrainings.length > 0 && (
                <>
                  {onboarding.hasEducationDetails && <Separator />}
                  <div>
                    <Label className="text-muted-foreground mb-2 block font-semibold">
                      Training Documents
                    </Label>
                    <div className="space-y-2">
                      {onboarding.seafarerTrainings.map((training: any) =>
                        training.documents?.map((doc: any) => (
                          <div
                            key={doc.documentId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="font-medium text-sm">
                                  {doc.documentTypeDescription || "Training Document"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Training: {training.certificateName || "N/A"}
                                </p>
                                {doc.documentNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    Document No: {doc.documentNumber}
                                  </p>
                                )}
                                {doc.issueDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Issued: {format(new Date(doc.issueDate), "PP")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!doc.filePathOrUrl?.trim()}
                              onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Voyage Documents */}
              {onboarding.voyageActivities && onboarding.voyageActivities.length > 0 && (
                <>
                  {(onboarding.hasEducationDetails || onboarding.seafarerTrainings?.length) && <Separator />}
                  <div>
                    <Label className="text-muted-foreground mb-2 block font-semibold">
                      Voyage Documents
                    </Label>
                    <div className="space-y-2">
                      {onboarding.voyageActivities.map((voyage: any) =>
                        voyage.documents?.map((doc: any) => (
                          <div
                            key={doc.documentId}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="font-medium text-sm">
                                  {doc.documentTypeDescription || "Voyage Document"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Vessel: {voyage.vesselName || "N/A"}
                                </p>
                                {doc.documentNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    Document No: {doc.documentNumber}
                                  </p>
                                )}
                                {doc.issueDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Issued: {format(new Date(doc.issueDate), "PP")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!doc.filePathOrUrl?.trim()}
                              onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Profile Documents */}
              {onboarding.profileDocuments && onboarding.profileDocuments.length > 0 && (
                <>
                  {(onboarding.hasEducationDetails || onboarding.seafarerTrainings?.length || onboarding.voyageActivities?.length) && <Separator />}
                  <div>
                    <Label className="text-muted-foreground mb-2 block font-semibold">
                      Profile Documents ({onboarding.profileDocumentCount ?? onboarding.profileDocuments.length})
                    </Label>
                    <div className="space-y-2">
                      {onboarding.profileDocuments.map((doc: any) => (
                        <div
                          key={doc.documentId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            <div>
                              <p className="font-medium text-sm">
                                {doc.documentTypeDescription || "Profile Document"}
                              </p>
                              {doc.documentNumber && (
                                <p className="text-xs text-muted-foreground">
                                  Document No: {doc.documentNumber}
                                </p>
                              )}
                              {doc.issuingAuthority && (
                                <p className="text-xs text-muted-foreground">
                                  Issuing Authority: {doc.issuingAuthority}
                                </p>
                              )}
                              {(doc.issueDate || doc.expiryDate) && (
                                <p className="text-xs text-muted-foreground">
                                  {doc.issueDate && `Issued: ${format(new Date(doc.issueDate), "PP")}`}
                                  {doc.issueDate && doc.expiryDate && " · "}
                                  {doc.expiryDate && `Expires: ${format(new Date(doc.expiryDate), "PP")}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!doc.filePathOrUrl?.trim()}
                            onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Institution Documents */}
              {onboarding.hasInstitutionDocuments && onboarding.institutionDocuments && onboarding.institutionDocuments.length > 0 && (
                <>
                  {(onboarding.hasEducationDetails || onboarding.seafarerTrainings?.length || onboarding.voyageActivities?.length || onboarding.profileDocuments?.length) && <Separator />}
                  <div>
                    <Label className="text-muted-foreground mb-2 block font-semibold">
                      Institution Documents ({onboarding.institutionDocumentCount ?? onboarding.institutionDocuments.length})
                    </Label>
                    <div className="space-y-2">
                      {onboarding.institutionDocuments.map((doc: any) => (
                        <div
                          key={doc.documentId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="font-medium text-sm">
                                {doc.documentTypeDescription || "Institution Document"}
                              </p>
                              {doc.documentNumber && (
                                <p className="text-xs text-muted-foreground">
                                  Document No: {doc.documentNumber}
                                </p>
                              )}
                              {doc.issuingAuthority && (
                                <p className="text-xs text-muted-foreground">
                                  Issuing Authority: {doc.issuingAuthority}
                                </p>
                              )}
                              {(doc.issueDate || doc.expiryDate) && (
                                <p className="text-xs text-muted-foreground">
                                  {doc.issueDate && `Issued: ${format(new Date(doc.issueDate), "PP")}`}
                                  {doc.issueDate && doc.expiryDate && " · "}
                                  {doc.expiryDate && `Expires: ${format(new Date(doc.expiryDate), "PP")}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!doc.filePathOrUrl?.trim()}
                            onClick={() => handleDownloadDocument(doc.filePathOrUrl)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Empty State */}
              {(!onboarding.hasEducationDetails || (onboarding.educationDocumentCount ?? 0) === 0) &&
                (!onboarding.seafarerTrainings?.length || onboarding.seafarerTrainings.every((t: any) => !t.documents?.length)) &&
                (!onboarding.voyageActivities?.length || onboarding.voyageActivities.every((v: any) => !v.documents?.length)) &&
                (!onboarding.profileDocuments?.length) &&
                (!onboarding.hasInstitutionDocuments || (onboarding.institutionDocumentCount ?? 0) === 0) && (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



