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
import { useAuthStore } from "@/store";
import {
  getSeafarerRequirements,
  createSeafarerProfile,
  addSeafarerContact,
  uploadSeafarerDocument,
  getSeafarerDocuments,
  type SeafarerRequirement,
  type HeldDocumentDto,
} from "@/lib/services/seafarer-onboarding-service";

type Step = "requirements" | "profile" | "contacts" | "documents";

export default function SeafarerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>("requirements");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements
  const [requirements, setRequirements] = useState<SeafarerRequirement[]>([]);
  const [completedRequirements, setCompletedRequirements] = useState<string[]>(
    [],
  );

  // Profile
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    middleName: user?.middleName || "",
    dateOfBirth: "",
    nationalityId: "",
    rankId: "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [seafarerId, setSeafarerId] = useState<string | null>(null);

  // Contacts
  const [contacts, setContacts] = useState([
    {
      firstName: "",
      lastName: "",
      relationship: "",
      phoneNumber: "",
      email: "",
      address: "",
      isEmergencyContact: false,
    },
  ]);

  // Documents
  const [documents, setDocuments] = useState<HeldDocumentDto[]>([]);
  const [documentUploads, setDocumentUploads] = useState<
    Map<string, { file: File | null; data: any }>
  >(new Map());

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to continue");
      router.push("/auth/login");
      return;
    }
    loadRequirements();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (seafarerId && currentStep === "documents") {
      loadDocuments();
    }
  }, [seafarerId, currentStep]);

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const response = await getSeafarerRequirements();
      if (response.success && response.data) {
        setRequirements(response.data.requirements || []);
        setCompletedRequirements(response.data.completedRequirements || []);
      }
    } catch (error) {
      toast.error("Failed to load requirements");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!seafarerId) return;
    try {
      const response = await getSeafarerDocuments(seafarerId);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      toast.error("Failed to load documents");
    }
  };

  const handleProfileSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await createSeafarerProfile(profileData);
      if (response.success && response.data) {
        setSeafarerId(response.data.seafarerId || response.data.id);
        toast.success("Profile created successfully");
        setCurrentStep("contacts");
      }
    } catch (error) {
      toast.error("Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        firstName: "",
        lastName: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        address: "",
        isEmergencyContact: false,
      },
    ]);
  };

  const handleContactSubmit = async () => {
    if (!seafarerId) return;
    try {
      setIsSubmitting(true);
      for (const contact of contacts) {
        if (contact.firstName && contact.lastName) {
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

  const handleDocumentUpload = async (
    documentTypeId: string,
    file: File,
    documentData: any,
  ) => {
    if (!seafarerId) return;
    try {
      setIsSubmitting(true);
      const response = await uploadSeafarerDocument(seafarerId, file, {
        ...documentData,
        documentTypeId,
      });
      if (response.success) {
        toast.success("Document uploaded successfully");
        await loadDocuments();
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-start gap-3 p-4 rounded-lg border"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 mt-0.5 ${
                        completedRequirements.includes(req.id)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{req.name}</p>
                        {req.isRequired && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="mt-6"
                onClick={() => setCurrentStep("profile")}
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
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input
                    value={profileData.middleName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        middleName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label required>Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label required>Date of Birth</Label>
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label required>Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label required>Phone Number</Label>
                  <Input
                    value={profileData.phoneNumber}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData({ ...profileData, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={profileData.country}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        country: e.target.value,
                      })
                    }
                  />
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
                <Button onClick={handleProfileSubmit} loading={isSubmitting}>
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
                        <Label>First Name</Label>
                        <Input
                          value={contact.firstName}
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
                          value={contact.lastName}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].lastName = e.target.value;
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
                        <Label>Phone Number</Label>
                        <Input
                          value={contact.phoneNumber}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].phoneNumber = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].email = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
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
              <CardTitle>Held Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.documentTypeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.documentNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Uploaded</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
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
                    toast.success("Onboarding completed!");
                    router.push("/");
                  }}
                >
                  Complete Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
