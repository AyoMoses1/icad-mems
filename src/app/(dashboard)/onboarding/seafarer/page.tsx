"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  UserPlus,
  Phone,
  Mail,
  MapPin,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store";
import {
  getSeafarerRequirements,
  createSeafarerProfile,
  addSeafarerContact,
  uploadSeafarerDocument,
  getSeafarerDocuments,
  type SeafarerRequirement,
  type HeldDocumentDto,
  type SeafarerProfileRequest,
} from "@/lib/services/seafarer-onboarding-service";
import {
  getNationalities,
  type NationalityDto,
} from "@/lib/services/nationalities";
import { getRanks, type RankDto } from "@/lib/services/ranks";
import { formatDate } from "@/lib/utils";

type Step = "requirements" | "profile" | "contacts" | "documents";

export default function SeafarerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("requirements");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements
  const [requirements, setRequirements] = useState<SeafarerRequirement[]>([]);

  // Profile
  const [nationalities, setNationalities] = useState<NationalityDto[]>([]);
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(false);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(false);
  const [profileData, setProfileData] = useState({
    FirstName: "",
    LastName: "",
    MiddleName: "",
    DateOfBirth: "",
    Gender: "",
    Nationality: "",
    NationalityId: "",
    NinNumber: "",
    SidNumber: "",
    DischargeBookNo: "",
    CurrentRankId: "",
    Email: "",
    PhoneNumber: "",
    AlternativePhoneNumber: "",
    Country: "",
    State: "",
    City: "",
    ResidentialAddress: "",
    HomeAddress: "",
    MeansOfIdentification: "",
    IdNumber: "",
    IsActive: true,
    WalletAddress: "",
    ProfilePictureUrl: "",
    AuthUserId: "",
  });
  const [seafarerId, setSeafarerId] = useState<string | null>(null);

  // Contacts
  const [contacts, setContacts] = useState([
    {
      fullName: "",
      relationship: "",
      phoneNumber: "",
      isPrimary: false,
    },
  ]);

  // Documents
  const [documents, setDocuments] = useState<HeldDocumentDto[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<SeafarerRequirement | null>(null);
  const [documentFormData, setDocumentFormData] = useState({
    DocumentNumber: "",
    IssueDate: "",
    ExpiryDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to continue");
      router.push("/auth/login");
      return;
    }
    loadRequirements();
    loadNationalities();
    loadRanks();
  }, [isAuthenticated, router]);

  const loadNationalities = async () => {
    setIsLoadingNationalities(true);
    try {
      const data = await getNationalities();
      setNationalities(data || []);
    } catch (error) {
      console.error("Failed to load nationalities", error);
    } finally {
      setIsLoadingNationalities(false);
    }
  };

  const loadRanks = async () => {
    setIsLoadingRanks(true);
    try {
      const res = await getRanks({
        pageNumber: 1,
        pageSize: 50,
        sortDirection: "asc",
      });
      const items = res.items || [];
      setRanks(items);
    } catch (error) {
      console.error("Failed to load ranks", error);
    } finally {
      setIsLoadingRanks(false);
    }
  };

  useEffect(() => {
    if (seafarerId && currentStep === "documents") {
      loadDocuments();
    }
  }, [seafarerId, currentStep]);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const response = await getSeafarerRequirements();
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        // Response data is an array directly
        const requirementsArray = Array.isArray(response.data)
          ? response.data
          : [];
        setRequirements(requirementsArray);
      } else {
        setRequirements([]);
        if (!ok) {
          toast.error(response.message || "Failed to load requirements");
        }
      }
    } catch (error) {
      console.error("Error loading requirements:", error);
      toast.error("Failed to load requirements");
      setRequirements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!seafarerId) return;
    try {
      const response = await getSeafarerDocuments(seafarerId);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        // Handle both array and object with items property
        const docs = Array.isArray(response.data)
          ? response.data
          : (response.data as any).items || [];
        setDocuments(docs);
        console.log("Loaded documents:", docs);
      } else {
        console.warn("Failed to load documents:", response);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    }
  };

  const handleProfileSubmit = async () => {
    if (
      !profileData.FirstName ||
      !profileData.LastName ||
      !profileData.Email ||
      !profileData.PhoneNumber ||
      !profileData.NinNumber
    ) {
      toast.error(
        "Please fill in all required fields (First Name, Last Name, Email, Phone Number, and NIN Number)",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      // Prepare payload - API expects PascalCase keys and multipart/form-data
      // Only include fields that are in the swagger definition
      const payload: SeafarerProfileRequest = {
        FirstName: profileData.FirstName.trim(),
        LastName: profileData.LastName.trim(),
        DateOfBirth: profileData.DateOfBirth || undefined,
        Gender: profileData.Gender || undefined,
        Nationality: profileData.Nationality || undefined,
        NationalityId: profileData.NationalityId || undefined,
        NinNumber: profileData.NinNumber?.trim() || undefined,
        SidNumber: profileData.SidNumber?.trim() || undefined,
        DischargeBookNo: profileData.DischargeBookNo?.trim() || undefined,
        CurrentRankId: profileData.CurrentRankId || undefined,
        Email: profileData.Email.trim(),
        PhoneNumber: profileData.PhoneNumber.trim(),
        HomeAddress: profileData.HomeAddress?.trim() || undefined,
        IsActive: profileData.IsActive,
        WalletAddress: profileData.WalletAddress?.trim() || undefined,
      };

      // Handle profile picture file if provided
      const profilePictureFile = profileData.ProfilePictureUrl
        ? undefined // TODO: Convert URL to File if needed, or add file upload input
        : undefined;

      const response = await createSeafarerProfile(payload, profilePictureFile);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSeafarerId(response.data.seafarerId || response.data.id);
        toast.success("Profile created successfully");
        setCurrentStep("contacts");
      } else {
        toast.error(response.message || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        fullName: "",
        relationship: "",
        phoneNumber: "",
        isPrimary: false,
      },
    ]);
  };

  const handleContactSubmit = async () => {
    if (!seafarerId) return;
    try {
      setIsSubmitting(true);
      for (const contact of contacts) {
        if (contact.fullName && contact.phoneNumber) {
          await addSeafarerContact(seafarerId, contact);
        }
      }
      toast.success("Contacts added successfully");
      setCurrentStep("documents");
    } catch (error) {
      toast.error("Failed to add contacts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUploadDialog = (requirement: SeafarerRequirement) => {
    setSelectedRequirement(requirement);
    setDocumentFormData({
      DocumentNumber: "",
      IssueDate: "",
      ExpiryDate: "",
    });
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleDocumentFormSubmit = async () => {
    if (!seafarerId || !selectedRequirement || !selectedFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!documentFormData.DocumentNumber || !documentFormData.IssueDate) {
      toast.error("Document Number and Issue Date are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (!selectedRequirement.documentMasterId) {
        toast.error("Invalid document requirement");
        return;
      }
      const response = await uploadSeafarerDocument(seafarerId, selectedFile, {
        DocumentMasterId: selectedRequirement.documentMasterId,
        DocumentNumber: documentFormData.DocumentNumber.trim(),
        IssueDate: documentFormData.IssueDate,
        ExpiryDate: documentFormData.ExpiryDate || undefined,
      });
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Document uploaded successfully");
        await loadDocuments();
        setUploadDialogOpen(false);
        setSelectedRequirement(null);
        setDocumentFormData({
          DocumentNumber: "",
          IssueDate: "",
          ExpiryDate: "",
        });
        setSelectedFile(null);
      } else {
        toast.error(response.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentForRequirement = (documentMasterId: string | undefined) => {
    if (!documentMasterId) return undefined;
    const found = documents.find((doc) => {
      // Try both camelCase and PascalCase
      const docId = doc.documentMasterId || (doc as any).DocumentMasterId;
      return docId === documentMasterId;
    });
    console.log(
      `Looking for documentMasterId: ${documentMasterId}, Found:`,
      found,
    );
    return found;
  };

  const progress = () => {
    const steps = ["requirements", "profile", "contacts", "documents"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seafarer Onboarding"
        description="Complete your profile to get started"
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
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {requirements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No requirements found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          req.isMandatory ? "text-orange-600" : "text-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-base">{req.name}</p>
                            {req.categoryType && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Category: {req.categoryType}
                              </p>
                            )}
                            {req.userType && (
                              <p className="text-xs text-muted-foreground mt-1">
                                User Type: {req.userType}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {req.isMandatory ? (
                              <Badge variant="destructive">Mandatory</Badge>
                            ) : (
                              <Badge variant="secondary">Optional</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                className="mt-6 w-full"
                onClick={() => setCurrentStep("profile")}
                disabled={requirements.length === 0}
              >
                Continue to Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* First Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profileData.FirstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          FirstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profileData.LastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          LastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.PhoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          PhoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={profileData.Country}
                      onValueChange={(value) =>
                        setProfileData({ ...profileData, Country: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="South Africa">
                          South Africa
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.City}
                      onChange={(e) =>
                        setProfileData({ ...profileData, City: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ninNumber">NIN Number</Label>
                    <Input
                      id="ninNumber"
                      value={profileData.NinNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          NinNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Second Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={profileData.MiddleName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          MiddleName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.Email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          Email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alternativePhoneNumber">
                      Alternative Phone Number
                    </Label>
                    <Input
                      id="alternativePhoneNumber"
                      value={profileData.AlternativePhoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          AlternativePhoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.DateOfBirth}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          DateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meansOfIdentification">
                      Means of Identification
                    </Label>
                    <Select
                      value={profileData.MeansOfIdentification}
                      onValueChange={(value) =>
                        setProfileData({
                          ...profileData,
                          MeansOfIdentification: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select means of identification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="National ID">National ID</SelectItem>
                        <SelectItem value="Driver License">
                          Driver License
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profileData.State}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          State: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-2">
                <Label htmlFor="residentialAddress">Residential Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="residentialAddress"
                    className="pl-10"
                    value={profileData.ResidentialAddress}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        ResidentialAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.Gender}
                      onValueChange={(value) =>
                        setProfileData({ ...profileData, Gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalityId">Nationality</Label>
                    <Select
                      value={profileData.NationalityId}
                      onValueChange={(value) => {
                        setProfileData({
                          ...profileData,
                          NationalityId: value,
                        });
                        const selected = nationalities.find(
                          (n) => n.id === value,
                        );
                        if (selected) {
                          setProfileData({
                            ...profileData,
                            NationalityId: value,
                            Nationality:
                              selected.countryName ||
                              selected.isoCode3 ||
                              value,
                          });
                        }
                      }}
                      disabled={isLoadingNationalities}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.countryName || n.isoCode3 || n.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidNumber">SID Number</Label>
                    <Input
                      id="sidNumber"
                      value={profileData.SidNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          SidNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dischargeBookNo">Discharge Book No</Label>
                    <Input
                      id="dischargeBookNo"
                      value={profileData.DischargeBookNo}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          DischargeBookNo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentRankId">Current Rank</Label>
                    <Select
                      value={profileData.CurrentRankId}
                      onValueChange={(value) =>
                        setProfileData({
                          ...profileData,
                          CurrentRankId: value,
                        })
                      }
                      disabled={isLoadingRanks}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {ranks.map((rank) => (
                          <SelectItem key={rank.id} value={rank.id}>
                            {rank.title || rank.category || rank.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={profileData.IdNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          IdNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeAddress">Home Address</Label>
                    <Input
                      id="homeAddress"
                      value={profileData.HomeAddress}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          HomeAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={profileData.WalletAddress}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          WalletAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePictureUrl">
                      Profile Picture URL
                    </Label>
                    <Input
                      id="profilePictureUrl"
                      value={profileData.ProfilePictureUrl}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          ProfilePictureUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={profileData.IsActive}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          IsActive: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("requirements")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleProfileSubmit}
                  loading={isSubmitting}
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                >
                  Save & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Emergency Contacts</CardTitle>
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
                        <Label>Full Name *</Label>
                        <Input
                          value={contact.fullName}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].fullName = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Relationship</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].relationship = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Phone Number *</Label>
                        <Input
                          value={contact.phoneNumber}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].phoneNumber = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={contact.isPrimary}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].isPrimary = e.target.checked;
                            setContacts(newContacts);
                          }}
                        />
                        <Label className="cursor-pointer">
                          Primary Contact
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("profile")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleContactSubmit} loading={isSubmitting}>
                  Save & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Held Documents</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload the required documents for your onboarding
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDocuments}
                  disabled={!seafarerId}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No requirements found</p>
                  </div>
                ) : (
                  requirements.map((req) => {
                    const uploadedDoc = req.documentMasterId
                      ? getDocumentForRequirement(req.documentMasterId)
                      : undefined;
                    return (
                      <div
                        key={req.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <CheckCircle2
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            uploadedDoc
                              ? "text-green-600"
                              : req.isMandatory
                                ? "text-orange-600"
                                : "text-gray-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-base">
                                {req.name}
                              </p>
                              {req.categoryType && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Category: {req.categoryType}
                                </p>
                              )}
                              {uploadedDoc && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    Document Number:{" "}
                                    {uploadedDoc.documentNumber || "N/A"}
                                  </p>
                                  {uploadedDoc.issueDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Issued:{" "}
                                      {formatDate(uploadedDoc.issueDate)}
                                    </p>
                                  )}
                                  {uploadedDoc.expiryDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Expires:{" "}
                                      {formatDate(uploadedDoc.expiryDate)}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {req.isMandatory && !uploadedDoc && (
                                <Badge variant="destructive">Mandatory</Badge>
                              )}
                              {uploadedDoc ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Uploaded
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant={
                                    req.isMandatory ? "default" : "outline"
                                  }
                                  onClick={() => openUploadDialog(req)}
                                  disabled={!seafarerId}
                                  className={
                                    req.isMandatory
                                      ? "bg-orange-600 hover:bg-orange-700"
                                      : ""
                                  }
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  {req.isMandatory ? "Required" : "Upload"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("contacts")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    // Check if profile is completed
                    if (!seafarerId) {
                      toast.error("Please complete your profile first");
                      return;
                    }

                    // Check mandatory documents
                    const mandatoryDocs = requirements.filter(
                      (r) => r.isMandatory && r.documentMasterId,
                    );

                    console.log("Mandatory docs:", mandatoryDocs);
                    console.log("All documents:", documents);

                    const uploadedMandatoryDocs = mandatoryDocs.filter((r) => {
                      const doc = getDocumentForRequirement(r.documentMasterId);
                      return !!doc;
                    });

                    console.log(
                      `Uploaded mandatory docs: ${uploadedMandatoryDocs.length}/${mandatoryDocs.length}`,
                    );

                    if (
                      mandatoryDocs.length > 0 &&
                      uploadedMandatoryDocs.length < mandatoryDocs.length
                    ) {
                      const missing = mandatoryDocs.filter((r) => {
                        const doc = getDocumentForRequirement(
                          r.documentMasterId,
                        );
                        return !doc;
                      });
                      toast.error(
                        `Please upload all mandatory documents (${uploadedMandatoryDocs.length}/${mandatoryDocs.length} uploaded). Missing: ${missing.map((r) => r.name).join(", ")}`,
                      );
                      return;
                    }

                    toast.success("Onboarding completed!");
                    router.push("/seafarer/dashboard");
                  }}
                >
                  Complete Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Document Dialog */}
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Upload {selectedRequirement?.name || "Document"}
                </DialogTitle>
                <DialogDescription>
                  {selectedRequirement?.isMandatory && (
                    <span className="text-orange-600 font-medium">
                      This is a mandatory document
                    </span>
                  )}
                  {selectedRequirement?.categoryType && (
                    <p className="mt-1">
                      Category: {selectedRequirement.categoryType}
                    </p>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label required>Document Number *</Label>
                  <Input
                    value={documentFormData.DocumentNumber}
                    onChange={(e) =>
                      setDocumentFormData({
                        ...documentFormData,
                        DocumentNumber: e.target.value,
                      })
                    }
                    placeholder="Enter document number"
                    maxLength={200}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label required>Issue Date *</Label>
                    <Input
                      type="date"
                      value={documentFormData.IssueDate}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          IssueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={documentFormData.ExpiryDate}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          ExpiryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label required>File *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setSelectedRequirement(null);
                    setDocumentFormData({
                      DocumentNumber: "",
                      IssueDate: "",
                      ExpiryDate: "",
                    });
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDocumentFormSubmit}
                  loading={isSubmitting}
                  disabled={
                    !selectedFile ||
                    !documentFormData.DocumentNumber ||
                    !documentFormData.IssueDate
                  }
                >
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
