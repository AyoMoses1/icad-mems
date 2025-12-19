"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Download,
  Ship,
  Upload,
  MapPin,
  Phone,
  Eye,
  Mail,
  Globe,
  User,
  FileText,
  Calendar,
  Building,
  Hash,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser, useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { apiGetMain, ApiResponse } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface PersonalInfoData {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  gender: string;
  nationality: string;
  dob: string;
  seafarerId: string;
}

interface ContactDetailsData {
  email: string;
  phone: string;
  altPhone: string;
  whatsapp: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  address: string;
}

const getStorageKey = (email: string, type: "personal" | "contact") => {
  return `profile-${type}-${email}`;
};

const loadFromStorage = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

interface UploadDocumentFormData {
  file: File | null;
  documentTypeId: number | null;
  expiryDate: string;
  issueDate: string;
  issuingAuthority: string;
  documentNumber: string;
  notes: string;
}

interface DocumentTypesResponse {
  name: string;
  description: string;
  isMandatory: boolean;
  isActive: boolean;
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export default function ProfileDocumentsPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const user = useUser();
  const userEmail = user?.email || "";
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentTypesResponse[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypesResponse[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<UploadDocumentFormData>({
    file: null,
    documentTypeId: null,
    expiryDate: "",
    issueDate: "",
    issuingAuthority: "",
    documentNumber: "",
    notes: "",
  });
  const [fileName, setFileName] = useState<string>("");

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    gender: "male",
    nationality: "",
    dob: "",
    seafarerId: "",
  });

  // Contact Details state
  const [contactDetails, setContactDetails] = useState<ContactDetailsData>({
    email: "",
    phone: "",
    altPhone: "",
    whatsapp: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    address: "",
  });

  const uploadDocument = async (formData: FormData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

    if (!API_BASE_URL) {
      throw new Error("API base URL is not configured");
    }

    const token = useAuthStore.getState().token;
    const url = `${API_BASE_URL}/api/v1/Documents/users/me/documents`;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data: ApiResponse<UploadDocumentFormData> = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Request failed");
    }

    return data;
  };

  const getUserDocuments = async () => {
    const response = await apiGetMain<any[]>(
      "/api/v1/Documents/users/me/documents",
    );
    if (response.success) {
      console.log("response", response);
      setDocuments(response.data || []);
    } else {
      toast.error(response.message || "Failed to fetch documents");
    }
  };

  // Download document handler
  const handleDownloadDocument = async (
    documentId: string,
    fileName: string,
  ) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const token = useAuthStore.getState().token;
      const url = `${API_BASE_URL}/api/v1/Documents/users/me/documents/${documentId}/download`;

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to download document");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Please try again.");
    }
  };

  // Preview document handler
  const handlePreviewDocument = async (document: any) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const token = useAuthStore.getState().token;
      const url = `${API_BASE_URL}/api/v1/Documents/users/me/documents/${document.id}/download`;

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to load document for preview");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      setPreviewUrl(blobUrl);
      setPreviewDocument(document);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Failed to preview document. Please try again.");
    }
  };

  // Clean up preview URL when modal closes
  useEffect(() => {
    if (!isPreviewModalOpen && previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setPreviewDocument(null);
    }
  }, [isPreviewModalOpen, previewUrl]);
  // Load data from localStorage on mount or when user email changes
  useEffect(() => {
    if (!userEmail) {
      console.log("No user email available");
      return;
    }

    console.log("User from auth store:", user);
    console.log("User email:", userEmail);
    console.log("User firstName:", user?.firstName);
    console.log("User lastName:", user?.lastName);
    console.log("User middleName:", user?.middleName);
    console.log("User username:", user?.username);

    const personalKey = getStorageKey(userEmail, "personal");
    const contactKey = getStorageKey(userEmail, "contact");

    const savedPersonal = loadFromStorage<PersonalInfoData>(personalKey);
    const savedContact = loadFromStorage<ContactDetailsData>(contactKey);
    console.log("savedPersonal", savedPersonal);
    console.log("savedContact", savedContact);

    // Load Personal Information: prioritize localStorage, then user object, then empty
    if (savedPersonal) {
      console.log("Loading personal info from localStorage");
      setPersonalInfo(savedPersonal);
    } else if (user) {
      // Populate from user session if localStorage doesn't have saved data
      console.log("Loading personal info from user session");
      const personalData: PersonalInfoData = {
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        gender: "male", // Default value
        nationality: "",
        dob: "",
        seafarerId: "",
      };
      console.log("Setting personal info from user:", personalData);
      setPersonalInfo(personalData);
    } else {
      console.log("No saved data or user data, using empty fields");
    }

    // Load Contact Details: prioritize localStorage, then user object, then empty
    if (savedContact) {
      console.log("Loading contact details from localStorage");
      setContactDetails(savedContact);
    } else if (user) {
      // Populate email and phone from user session if localStorage doesn't have saved data
      console.log("Loading contact details from user session");
      const contactData: ContactDetailsData = {
        email: user.email || "",
        phone: user.phoneNumber || "",
        altPhone: "",
        whatsapp: "",
        city: "",
        state: "",
        country: user.country || "",
        postalCode: "",
        address: "",
      };
      console.log("Setting contact details from user:", contactData);
      setContactDetails(contactData);
    } else {
      console.log("No saved contact data or user data, using empty fields");
    }
  }, [userEmail, user]);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      const response = await apiGetMain<DocumentTypesResponse[]>(
        "/api/v1/lookups/documenttype",
      );
      console.log("response", response);
      if (response.success) {
        setDocumentTypes(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch document types");
      }
    };
    fetchDocumentTypes();
    getUserDocuments();
  }, []);

  // Save Personal Information
  const handleSavePersonalInfo = () => {
    if (!userEmail) {
      alert("Please log in to save your information");
      return;
    }
    const key = getStorageKey(userEmail, "personal");
    saveToStorage(key, personalInfo);
    alert("Personal information saved successfully!");
  };

  // Save Contact Details
  const handleSaveContactDetails = () => {
    if (!userEmail) {
      alert("Please log in to save your information");
      return;
    }
    const key = getStorageKey(userEmail, "contact");
    saveToStorage(key, contactDetails);
    alert("Contact details saved successfully!");
  };

  // Upload Document handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData({ ...uploadFormData, file });
      setFileName(file.name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!uploadFormData.file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!uploadFormData.documentTypeId) {
      toast.error("Please select a document type");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("file", uploadFormData.file);
      submitData.append(
        "DocumentTypeId",
        uploadFormData.documentTypeId.toString(),
      );

      if (uploadFormData.expiryDate) {
        submitData.append("ExpiryDate", uploadFormData.expiryDate);
      }

      if (uploadFormData.issueDate) {
        submitData.append("IssueDate", uploadFormData.issueDate);
      }

      if (uploadFormData.issuingAuthority) {
        submitData.append("IssuingAuthority", uploadFormData.issuingAuthority);
      }

      if (uploadFormData.documentNumber) {
        submitData.append("DocumentNumber", uploadFormData.documentNumber);
      }

      if (uploadFormData.notes) {
        submitData.append("Notes", uploadFormData.notes);
      }

      // Call the upload API
      const response = await uploadDocument(submitData);

      if (response.success) {
        toast.success("Document uploaded successfully!");

        // Reset form and close modal
        setUploadFormData({
          file: null,
          documentTypeId: null,
          expiryDate: "",
          issueDate: "",
          issuingAuthority: "",
          documentNumber: "",
          notes: "",
        });
        setFileName("");
        setIsUploadModalOpen(false);

        // Refresh documents list
        await getUserDocuments();
      } else {
        throw new Error(response.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const documents = [
  //   {
  //     id: "1",
  //     name: "Passport Copy",
  //     type: "PDF",
  //     uploadedDate: "15 Jan 2023",
  //   },
  //   {
  //     id: "2",
  //     name: "CDC Document",
  //     type: "PDF",
  //     uploadedDate: "15 Jan 2023",
  //   },
  //   {
  //     id: "3",
  //     name: "Medical Certificate",
  //     type: "PDF",
  //     uploadedDate: "15 Jan 2023",
  //   },
  //   {
  //     id: "4",
  //     name: "STCW Certificates Bundle",
  //     type: "PDF",
  //     uploadedDate: "15 Jan 2023",
  //   },
  //   {
  //     id: "5",
  //     name: "COC Certificate",
  //     type: "PDF",
  //     uploadedDate: "15 Jan 2023",
  //   },
  // ];

  const seaServiceRecords = [
    {
      id: "1",
      vessel: "MV Pacific Trader",
      company: "Pacific Shipping Ltd",
      vesselType: "Container Ship",
      rank: "Master",
      period: "Jun 2023 - Present",
      isCurrent: true,
    },
    {
      id: "2",
      vessel: "MV Pacific Trader",
      company: "Pacific Shipping Ltd",
      vesselType: "Container Ship",
      rank: "Chief Officer",
      period: "Sept 2021 - May 2023",
      isCurrent: false,
    },
    {
      id: "3",
      vessel: "MV Pacific Trader",
      company: "Pacific Shipping Ltd",
      vesselType: "Container Ship",
      rank: "Second Officer",
      period: "Mar 2019 - Aug 2021",
      isCurrent: false,
    },
    {
      id: "4",
      vessel: "MV Pacific Trader",
      company: "Pacific Shipping Ltd",
      vesselType: "Container Ship",
      rank: "Second Officer",
      period: "Jan 2017 - Feb 2019",
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Documents"
        description="Manage your personal information and uploaded documents"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="contact">Contact Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sea-service">Sea Service</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={personalInfo.middleName}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          middleName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Preferred Username</Label>
                    <Input
                      id="username"
                      value={personalInfo.username}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value) =>
                        setPersonalInfo({ ...personalInfo, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={personalInfo.nationality}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          nationality: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={personalInfo.dob}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          dob: e.target.value,
                        })
                      }
                      placeholder="Select Date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seafarerId">Seafarer ID</Label>
                    <Input
                      id="seafarerId"
                      value={personalInfo.seafarerId}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          seafarerId: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  onClick={handleSavePersonalInfo}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Details Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={contactDetails.phone}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altPhone">Alternative Phone Number</Label>
                    <Input
                      id="altPhone"
                      value={contactDetails.altPhone}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          altPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Whatsapp Number</Label>
                    <Input
                      id="whatsapp"
                      value={contactDetails.whatsapp}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          whatsapp: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={contactDetails.city}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={contactDetails.state}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={contactDetails.country}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={contactDetails.postalCode}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          postalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-10"
                      value={contactDetails.address}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveContactDetails();
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <div className="flex items-center justify-between ">
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <div className="pr-5">
                <Button
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </div>

            <CardContent>
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.documentTypeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.fileName} • Uploaded {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePreviewDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadDocument(doc.id, doc.fileName)
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sea Service Tab */}
        <TabsContent value="sea-service" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sea Service Record</CardTitle>
                <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seaServiceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Ship className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{record.vessel}</h3>
                          {record.isCurrent && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.company}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.vesselType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{record.rank}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.period}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Document Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentTypeId">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={uploadFormData.documentTypeId?.toString() || ""}
                onValueChange={(value) =>
                  setUploadFormData({
                    ...uploadFormData,
                    documentTypeId: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="documentTypeId">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type: DocumentTypesResponse) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                {fileName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="issueDate"
                  type="datetime-local"
                  value={uploadFormData.issueDate}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
                      issueDate: e.target.value,
                    })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={uploadFormData.expiryDate}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
                      expiryDate: e.target.value,
                    })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="space-y-2">
              <Label htmlFor="issuingAuthority">Issuing Authority</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="issuingAuthority"
                  value={uploadFormData.issuingAuthority}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
                      issuingAuthority: e.target.value,
                    })
                  }
                  placeholder="Enter issuing authority"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="documentNumber"
                  value={uploadFormData.documentNumber}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
                      documentNumber: e.target.value,
                    })
                  }
                  placeholder="Enter document number"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={uploadFormData.notes}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Enter any additional notes or comments"
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.documentTypeName || "Document Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-[400px]">
            {previewUrl && (
              <div className="w-full h-full">
                {previewDocument?.fileName?.toLowerCase().endsWith(".pdf") ||
                previewUrl.includes("application/pdf") ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[600px] border-0"
                    title="Document Preview"
                  />
                ) : previewDocument?.fileName
                    ?.toLowerCase()
                    .match(/\.(jpg|jpeg|png|gif|webp)$/) ||
                  previewUrl.includes("image/") ? (
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={previewUrl}
                      alt={previewDocument?.fileName || "Document Preview"}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleDownloadDocument(
                          previewDocument?.id,
                          previewDocument?.fileName,
                        )
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewModalOpen(false)}
            >
              Close
            </Button>
            {previewDocument && (
              <Button
                className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                onClick={() =>
                  handleDownloadDocument(
                    previewDocument.id,
                    previewDocument.fileName,
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
