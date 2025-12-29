"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Building2,
  GraduationCap,
  Stethoscope,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner } from "@/components/shared";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  addInstitutionContact,
  addInstitutionStaff,
  addTrainingInstitutionStaff,
  addMedicalInstitutionStaff,
  createTrainingInstitute,
  createMedicalInstitute,
  getInstitutionOnboardingRequirements,
  type InstitutionContactRequest,
  type InstitutionStaffRequest,
  type TrainingInstitutionStaffRequest,
  type MedicalInstitutionStaffRequest,
  type TrainingInstituteOnboardingRequest,
  type MedicalInstituteOnboardingRequest,
  type OnboardingRequirement,
} from "@/lib/services/institution-onboarding-service";
import {
  getInstitutions,
  type InstitutionDto,
} from "@/lib/services/institutions";
import { getRanks, type RankDto } from "@/lib/services/ranks";
import { useAuthStore } from "@/store";

type Step = "create" | "contacts" | "staff" | "complete";

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("create");
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institutionType, setInstitutionType] = useState<
    "training" | "medical" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [requirements, setRequirements] = useState<OnboardingRequirement[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(false);
  const [useExistingInstitution, setUseExistingInstitution] = useState(false);

  // Institution Creation Form (for training or medical)
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    nimasaAccreditationNo: "",
    accreditationExpiry: "",
    physicalAddress: "",
    email: "",
    isActive: true,
    // Training specific
    mtiCategory: "",
    hasSimulators: false,
    totalClassrooms: "",
    // Medical specific
    clinicLicenseNo: "",
    numApprovedDoctors: "",
    laboratoryEquipped: false,
  });

  // Contacts
  const [contacts, setContacts] = useState<InstitutionContactRequest[]>([
    {
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: "",
      phoneNumberPrimary: "",
      phoneNumberSecondary: "",
      officeExtension: "",
      isPrimaryContact: false,
      isActive: true,
    },
  ]);

  // Staff
  const [staff, setStaff] = useState<
    Array<
      | InstitutionStaffRequest
      | TrainingInstitutionStaffRequest
      | MedicalInstitutionStaffRequest
    >
  >([
    {
      firstName: "",
      lastName: "",
      email: "",
      staffType: "",
      isActive: true,
    },
  ]);

  useEffect(() => {
    loadInstitutions();
    loadRanks();
  }, []);

  // Load requirements when institution type is selected
  useEffect(() => {
    if (institutionType) {
      loadRequirements();
    }
  }, [institutionType]);

  const loadInstitutions = async () => {
    setIsLoadingInstitutions(true);
    try {
      const res = await getInstitutions({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      setInstitutions(res.items || []);
    } catch (error) {
      console.error("Failed to load institutions", error);
      toast.error("Failed to load institutions");
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  const loadRanks = async () => {
    setIsLoadingRanks(true);
    try {
      const response = await getRanks({
        pageNumber: 1,
        pageSize: 100,
        sortDirection: "asc",
      });
      setRanks(response.items || []);
    } catch (error) {
      console.error("Failed to load ranks", error);
      toast.error("Failed to load ranks");
    } finally {
      setIsLoadingRanks(false);
    }
  };

  const loadRequirements = async () => {
    if (!institutionType) return;
    setIsLoadingRequirements(true);
    try {
      const response = await getInstitutionOnboardingRequirements({
        institutionType:
          institutionType === "training" ? "training" : "medical",
      });
      if (response.success ?? (response as any).successful) {
        setRequirements(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load requirements", error);
      toast.error("Failed to load requirements");
    } finally {
      setIsLoadingRequirements(false);
    }
  };

  const handleCreateInstitution = async () => {
    if (!institutionType) {
      toast.error("Please select institution type");
      return;
    }

    if (!institutionForm.name || !institutionForm.nimasaAccreditationNo) {
      toast.error("Name and NIMASA Accreditation No are required");
      return;
    }

    if (!user?.id) {
      toast.error("User ID is required. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (institutionType === "training") {
        // All fields are required for training institutions
        const payload: TrainingInstituteOnboardingRequest = {
          name: institutionForm.name.trim(),
          nimasaAccreditationNo: institutionForm.nimasaAccreditationNo.trim(),
          accreditationExpiry: institutionForm.accreditationExpiry || undefined,
          physicalAddress: institutionForm.physicalAddress.trim() || "",
          email: institutionForm.email.trim() || "",
          isActive: institutionForm.isActive ?? true,
          authUserId: user.id,
          mtiCategory: institutionForm.mtiCategory.trim() || "",
          hasSimulators: institutionForm.hasSimulators ?? false,
          totalClassrooms: institutionForm.totalClassrooms
            ? parseInt(institutionForm.totalClassrooms)
            : 0,
        };
        response = await createTrainingInstitute(payload);
      } else {
        // All fields are required for medical institutions
        const payload: MedicalInstituteOnboardingRequest = {
          name: institutionForm.name.trim(),
          nimasaAccreditationNo: institutionForm.nimasaAccreditationNo.trim(),
          accreditationExpiry: institutionForm.accreditationExpiry || undefined,
          physicalAddress: institutionForm.physicalAddress.trim() || "",
          email: institutionForm.email.trim() || "",
          isActive: institutionForm.isActive ?? true,
          authUserId: user.id,
          clinicLicenseNo: institutionForm.clinicLicenseNo.trim() || "",
          numApprovedDoctors: institutionForm.numApprovedDoctors
            ? parseInt(institutionForm.numApprovedDoctors)
            : 0,
          laboratoryEquipped: institutionForm.laboratoryEquipped ?? false,
        };
        response = await createMedicalInstitute(payload);
      }

      if (response.success ?? (response as any).successful) {
        const createdId = response.data?.id;
        if (createdId) {
          setInstitutionId(createdId);
          toast.success("Institution created successfully");
          setCurrentStep("contacts");
        } else {
          toast.error("Failed to get institution ID from response");
        }
      } else {
        toast.error(response.message || "Failed to create institution");
      }
    } catch (error: any) {
      console.error("Failed to create institution", error);
      toast.error(error.message || "Failed to create institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExistingInstitution = (id: string) => {
    setInstitutionId(id);
    const selected = institutions.find((inst) => inst.id === id);
    if (selected?.institutionType) {
      const type = selected.institutionType.toLowerCase();
      if (type === "training" || type === "mti") {
        setInstitutionType("training");
      } else if (type === "medical") {
        setInstitutionType("medical");
      }
    }
    setCurrentStep("contacts");
  };

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        firstName: "",
        lastName: "",
        jobTitle: "",
        email: "",
        phoneNumberPrimary: "",
        phoneNumberSecondary: "",
        officeExtension: "",
        isPrimaryContact: false,
        isActive: true,
      },
    ]);
  };

  const handleContactSubmit = async () => {
    if (!institutionId) {
      toast.error("Institution ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const contact of contacts) {
        if (contact.firstName && contact.lastName) {
          const response = await addInstitutionContact(institutionId, contact);
          if (!(response.success ?? (response as any).successful)) {
            throw new Error(response.message || "Failed to add contact");
          }
        }
      }
      toast.success("Contacts added successfully");
      setCurrentStep("staff");
    } catch (error: any) {
      console.error("Failed to add contacts", error);
      toast.error(error.message || "Failed to add contacts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = () => {
    setStaff([
      ...staff,
      {
        firstName: "",
        lastName: "",
        email: "",
        staffType: "",
        isActive: true,
      },
    ]);
  };

  const handleStaffSubmit = async () => {
    if (!institutionId || !institutionType) {
      toast.error("Institution ID and type are required");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const staffMember of staff) {
        if (staffMember.firstName && staffMember.lastName) {
          let response;
          if (institutionType === "training") {
            const payload: TrainingInstitutionStaffRequest = {
              firstName: staffMember.firstName.trim() || undefined,
              lastName: staffMember.lastName.trim() || undefined,
              email: staffMember.email?.trim() || undefined,
              staffType: staffMember.staffType?.trim() || undefined,
              imoModel609CertNo:
                (staffMember as any).imoModel609CertNo?.trim() || undefined,
              highestCocHeldId:
                (staffMember as any).highestCocHeldId || undefined,
              yearsOfSeaExperience: (staffMember as any).yearsOfSeaExperience
                ? parseInt(String((staffMember as any).yearsOfSeaExperience))
                : undefined,
              isActive: staffMember.isActive ?? true,
            };
            response = await addTrainingInstitutionStaff(
              institutionId,
              payload,
            );
          } else {
            const payload: MedicalInstitutionStaffRequest = {
              firstName: staffMember.firstName.trim() || undefined,
              lastName: staffMember.lastName.trim() || undefined,
              email: staffMember.email?.trim() || undefined,
              staffType: staffMember.staffType?.trim() || undefined,
              medicalLicenseNo:
                (staffMember as any).medicalLicenseNo?.trim() || undefined,
              nimasaAuthorizedExaminerId:
                (staffMember as any).nimasaAuthorizedExaminerId?.trim() ||
                undefined,
              specialization:
                (staffMember as any).specialization?.trim() || undefined,
              isActive: staffMember.isActive ?? true,
            };
            response = await addMedicalInstitutionStaff(institutionId, payload);
          }

          if (!(response.success ?? (response as any).successful)) {
            throw new Error(response.message || "Failed to add staff");
          }
        }
      }
      toast.success("Staff added successfully");
      setCurrentStep("complete");
    } catch (error: any) {
      console.error("Failed to add staff", error);
      toast.error(error.message || "Failed to add staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    router.push("/institution/dashboard");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Onboarding"
        description="Complete your institution setup"
      />

      {/* Requirements */}
      {institutionType && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Requirements</CardTitle>
            <CardDescription>
              Review the requirements for{" "}
              {institutionType === "training" ? "Training" : "Medical"}{" "}
              institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRequirements ? (
              <LoadingSpinner />
            ) : requirements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No requirements found
              </p>
            ) : (
              <div className="space-y-2">
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Create or Select Institution */}
      {currentStep === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create or Select Institution</CardTitle>
            <CardDescription>
              Create a new institution or select an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useExisting"
                checked={useExistingInstitution}
                onCheckedChange={(checked) => {
                  setUseExistingInstitution(checked === true);
                  if (checked) {
                    setInstitutionId(null);
                    setInstitutionType(null);
                  }
                }}
              />
              <Label htmlFor="useExisting" className="cursor-pointer">
                Use existing institution
              </Label>
            </div>

            {useExistingInstitution ? (
              <div className="space-y-2">
                <Label>Select Institution</Label>
                <Select
                  value={institutionId || ""}
                  onValueChange={handleSelectExistingInstitution}
                  disabled={isLoadingInstitutions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an institution" />
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
            ) : (
              <>
                <div className="space-y-2">
                  <Label required>Institution Type</Label>
                  <Select
                    value={institutionType || ""}
                    onValueChange={(value) =>
                      setInstitutionType(value as "training" | "medical")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">
                        Training Institute (MTI)
                      </SelectItem>
                      <SelectItem value="medical">Medical Institute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {institutionType && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label required>Institution Name *</Label>
                        <Input
                          value={institutionForm.name}
                          onChange={(e) =>
                            setInstitutionForm({
                              ...institutionForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Institution name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label required>NIMASA Accreditation No *</Label>
                        <Input
                          value={institutionForm.nimasaAccreditationNo}
                          onChange={(e) =>
                            setInstitutionForm({
                              ...institutionForm,
                              nimasaAccreditationNo: e.target.value,
                            })
                          }
                          placeholder="Accreditation number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Accreditation Expiry</Label>
                        <Input
                          type="date"
                          value={institutionForm.accreditationExpiry}
                          onChange={(e) =>
                            setInstitutionForm({
                              ...institutionForm,
                              accreditationExpiry: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={institutionForm.email}
                          onChange={(e) =>
                            setInstitutionForm({
                              ...institutionForm,
                              email: e.target.value,
                            })
                          }
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Physical Address</Label>
                      <Textarea
                        value={institutionForm.physicalAddress}
                        onChange={(e) =>
                          setInstitutionForm({
                            ...institutionForm,
                            physicalAddress: e.target.value,
                          })
                        }
                        placeholder="Address"
                        rows={2}
                      />
                    </div>

                    {institutionType === "training" && (
                      <div className="space-y-4 pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground">
                          Training Institute Details
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>MTI Category</Label>
                            <Input
                              value={institutionForm.mtiCategory}
                              onChange={(e) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  mtiCategory: e.target.value,
                                })
                              }
                              placeholder="Category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Classrooms</Label>
                            <Input
                              type="number"
                              min="0"
                              value={institutionForm.totalClassrooms}
                              onChange={(e) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  totalClassrooms: e.target.value,
                                })
                              }
                              placeholder="Number of classrooms"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                              id="hasSimulators"
                              checked={institutionForm.hasSimulators}
                              onCheckedChange={(checked) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  hasSimulators: checked === true,
                                })
                              }
                            />
                            <Label
                              htmlFor="hasSimulators"
                              className="cursor-pointer"
                            >
                              Has Simulators
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {institutionType === "medical" && (
                      <div className="space-y-4 pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground">
                          Medical Institute Details
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Clinic License No</Label>
                            <Input
                              value={institutionForm.clinicLicenseNo}
                              onChange={(e) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  clinicLicenseNo: e.target.value,
                                })
                              }
                              placeholder="License number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Number of Approved Doctors</Label>
                            <Input
                              type="number"
                              min="0"
                              value={institutionForm.numApprovedDoctors}
                              onChange={(e) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  numApprovedDoctors: e.target.value,
                                })
                              }
                              placeholder="Number of doctors"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                              id="laboratoryEquipped"
                              checked={institutionForm.laboratoryEquipped}
                              onCheckedChange={(checked) =>
                                setInstitutionForm({
                                  ...institutionForm,
                                  laboratoryEquipped: checked === true,
                                })
                              }
                            />
                            <Label
                              htmlFor="laboratoryEquipped"
                              className="cursor-pointer"
                            >
                              Laboratory Equipped
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-4">
                      <Checkbox
                        id="isActive"
                        checked={institutionForm.isActive}
                        onCheckedChange={(checked) =>
                          setInstitutionForm({
                            ...institutionForm,
                            isActive: checked === true,
                          })
                        }
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">
                        Active
                      </Label>
                    </div>

                    <Button
                      onClick={handleCreateInstitution}
                      disabled={
                        isSubmitting ||
                        !institutionType ||
                        !institutionForm.name ||
                        !institutionForm.nimasaAccreditationNo
                      }
                      className="w-full"
                    >
                      {isSubmitting ? "Creating..." : "Create Institution"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Contacts */}
      {currentStep === "contacts" && institutionId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Institution Contacts</CardTitle>
                <CardDescription>
                  Add contact persons for your institution
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddContact}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={contact.firstName || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].firstName = e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={contact.lastName || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].lastName = e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={contact.jobTitle || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].jobTitle = e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={contact.email || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].email = e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Phone Number (Primary)</Label>
                      <Input
                        value={contact.phoneNumberPrimary || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].phoneNumberPrimary =
                            e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Phone Number (Secondary)</Label>
                      <Input
                        value={contact.phoneNumberSecondary || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].phoneNumberSecondary =
                            e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Office Extension</Label>
                      <Input
                        value={contact.officeExtension || ""}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].officeExtension = e.target.value;
                          setContacts(newContacts);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={contact.isPrimaryContact || false}
                          onCheckedChange={(checked) => {
                            const newContacts = [...contacts];
                            newContacts[index].isPrimaryContact =
                              checked === true;
                            setContacts(newContacts);
                          }}
                        />
                        <Label>Primary Contact</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={contact.isActive ?? true}
                          onCheckedChange={(checked) => {
                            const newContacts = [...contacts];
                            newContacts[index].isActive = checked === true;
                            setContacts(newContacts);
                          }}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("create")}
              >
                Back
              </Button>
              <Button onClick={handleContactSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Contacts & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Staff */}
      {currentStep === "staff" && institutionId && institutionType && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Institution Staff</CardTitle>
                <CardDescription>
                  Add staff members for your{" "}
                  {institutionType === "training" ? "training" : "medical"}{" "}
                  institution
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddStaff}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {staff.map((staffMember, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={staffMember.firstName || ""}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[index].firstName = e.target.value;
                          setStaff(newStaff);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={staffMember.lastName || ""}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[index].lastName = e.target.value;
                          setStaff(newStaff);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={staffMember.email || ""}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[index].email = e.target.value;
                          setStaff(newStaff);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Staff Type</Label>
                      <Input
                        value={staffMember.staffType || ""}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[index].staffType = e.target.value;
                          setStaff(newStaff);
                        }}
                      />
                    </div>

                    {institutionType === "medical" && (
                      <>
                        <div>
                          <Label>Medical License No</Label>
                          <Input
                            value={(staffMember as any).medicalLicenseNo || ""}
                            onChange={(e) => {
                              const newStaff = [...staff];
                              (newStaff[index] as any).medicalLicenseNo =
                                e.target.value;
                              setStaff(newStaff);
                            }}
                          />
                        </div>
                        <div>
                          <Label>NIMASA Authorized Examiner ID</Label>
                          <Input
                            value={
                              (staffMember as any).nimasaAuthorizedExaminerId ||
                              ""
                            }
                            onChange={(e) => {
                              const newStaff = [...staff];
                              (
                                newStaff[index] as any
                              ).nimasaAuthorizedExaminerId = e.target.value;
                              setStaff(newStaff);
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Specialization</Label>
                          <Input
                            value={(staffMember as any).specialization || ""}
                            onChange={(e) => {
                              const newStaff = [...staff];
                              (newStaff[index] as any).specialization =
                                e.target.value;
                              setStaff(newStaff);
                            }}
                          />
                        </div>
                      </>
                    )}

                    {institutionType === "training" && (
                      <>
                        <div>
                          <Label>IMO Model 609 Cert No</Label>
                          <Input
                            value={(staffMember as any).imoModel609CertNo || ""}
                            onChange={(e) => {
                              const newStaff = [...staff];
                              (newStaff[index] as any).imoModel609CertNo =
                                e.target.value;
                              setStaff(newStaff);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Highest CoC Held</Label>
                          <Select
                            value={(staffMember as any).highestCocHeldId || ""}
                            onValueChange={(value) => {
                              const newStaff = [...staff];
                              (newStaff[index] as any).highestCocHeldId = value;
                              setStaff(newStaff);
                            }}
                            disabled={isLoadingRanks}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select rank" />
                            </SelectTrigger>
                            <SelectContent>
                              {ranks.map((rank) => (
                                <SelectItem key={rank.id} value={rank.id}>
                                  {rank.title || rank.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Years of Sea Experience</Label>
                          <Input
                            type="number"
                            value={
                              (staffMember as any).yearsOfSeaExperience || ""
                            }
                            onChange={(e) => {
                              const newStaff = [...staff];
                              (newStaff[index] as any).yearsOfSeaExperience =
                                e.target.value;
                              setStaff(newStaff);
                            }}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={staffMember.isActive ?? true}
                        onCheckedChange={(checked) => {
                          const newStaff = [...staff];
                          newStaff[index].isActive = checked === true;
                          setStaff(newStaff);
                        }}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("contacts")}
              >
                Back
              </Button>
              <Button onClick={handleStaffSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Staff & Complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {currentStep === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Onboarding Complete!
            </CardTitle>
            <CardDescription>
              Your institution has been successfully onboarded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleComplete} className="w-full">
              Go to Institution Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
