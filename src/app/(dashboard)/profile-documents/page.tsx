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
import {
  getDocumentTypes,
  type DocumentTypeDto,
} from "@/lib/services/lookup-service";
import {
  getMySeafarer,
  type SeafarerDto,
} from "@/lib/services/seafarers";
import {
  getProfileDocuments,
  type EducationDocumentDto,
} from "@/lib/services/document-service";
import { getRanks, type RankDto } from "@/lib/services/ranks";
import {
  getNationalities,
  type NationalityDto,
} from "@/lib/services/nationalities";
import { createSeafarerProfile } from "@/lib/services/seafarer-onboarding-service";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  ninNumber: string;
  sidNumber: string;
  dischargeBookNo: string;
  currentRankId: string;
  email: string;
  phoneNumber: string;
  homeAddress: string;
  walletAddress: string;
  nationalityId: string;
  profilePictureUrl: string;
  profilePictureFile: File | null;
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
  documentTypeId: string | null;
  expiryDate: string;
  issueDate: string;
  issuingAuthority: string;
  documentNumber: string;
  notes: string;
}

export default function ProfileDocumentsPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const user = useUser();
  const userEmail = user?.email || "";
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [nationalities, setNationalities] = useState<NationalityDto[]>([]);
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
  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string>("");

  // Personal Information state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "",
    ninNumber: "",
    sidNumber: "",
    dischargeBookNo: "",
    currentRankId: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    walletAddress: "",
    nationalityId: "",
    profilePictureUrl: "",
    profilePictureFile: null,
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

  const uploadDocument = async (uploadData: UploadDocumentFormData) => {
    // Get RN from seafarer or user
    let rn: string | null = null;
    
    try {
      const seafarerResponse = await getMySeafarer();
      const seafarerOk = seafarerResponse.success ?? (seafarerResponse as any).successful;
      
      if (seafarerOk && seafarerResponse.data) {
        rn = (seafarerResponse.data as any).rn || (seafarerResponse.data as any).registrationNumber || null;
      }
      
      if (!rn) {
        const currentUser = useAuthStore.getState().user;
        rn = (currentUser as any)?.rn || (currentUser as any)?.registrationNumber || null;
      }
      
      if (!rn) {
        throw new Error("Registration Number (RN) not found. Please complete onboarding first.");
      }
    } catch (error) {
      console.error("Error getting RN:", error);
      throw new Error("Failed to get registration number. Please complete onboarding first.");
    }

    // Use document-service uploadProfileDocument
    const { uploadProfileDocument } = await import("@/lib/services/document-service");
    
    if (!uploadData.file || !uploadData.documentTypeId) {
      throw new Error("File and Document Type are required");
    }

    return await uploadProfileDocument({
      file: uploadData.file,
      rn,
      documentTypesId: uploadData.documentTypeId,
      documentNumber: uploadData.documentNumber || undefined,
      issueDate: uploadData.issueDate || undefined,
      expiryDate: uploadData.expiryDate || undefined,
      issuingAuthority: uploadData.issuingAuthority || undefined,
    });
  };

  const getUserDocuments = async () => {
    try {
      // First get seafarer profile to get RN
      const seafarerResponse = await getMySeafarer();
      const seafarerOk = seafarerResponse.success ?? (seafarerResponse as any).successful;
      
      let rn: string | null = null;
      
      if (seafarerOk && seafarerResponse.data) {
        // Try to get RN from seafarer data
        const seafarer = seafarerResponse.data;
        rn = (seafarer as any).rn || (seafarer as any).registrationNumber || null;
      }
      
      // If no RN from seafarer, try to get from user
      if (!rn) {
        const currentUser = useAuthStore.getState().user;
        rn = (currentUser as any)?.rn || (currentUser as any)?.registrationNumber || null;
      }
      
      if (rn) {
        const response = await getProfileDocuments(rn);
        const ok = response.success ?? (response as any).successful;
        
        if (ok && response.data) {
          const items = Array.isArray(response.data) ? response.data : [];
          setDocuments(items);
        } else {
          toast.error(response.message || "Failed to fetch documents");
          setDocuments([]);
        }
      } else {
        // No RN available yet - user may not be onboarded
        console.log("No RN available - user may need to complete onboarding");
        setDocuments([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
      toast.error(error.message || "Failed to fetch documents");
      setDocuments([]);
    }
  };

  // Download document handler
  const handleDownloadDocument = async (
    documentId: string,
    fileName: string,
    fileUrl?: string | null,
  ) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const token = useAuthStore.getState().token;

      // Build query parameters for /api/files/download
      const queryParams = new URLSearchParams();
      if (documentId) {
        queryParams.append("id", documentId);
      }
      if (fileUrl) {
        queryParams.append("url", fileUrl);
      }

      const url = `${API_BASE_URL}/api/files/download?${queryParams.toString()}`;

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

      // Build query parameters for /api/files/download
      const queryParams = new URLSearchParams();
      if (document.id) {
        queryParams.append("id", document.id);
      }
      if (document.fileUrl) {
        queryParams.append("url", document.fileUrl);
      }

      const url = `${API_BASE_URL}/api/files/download?${queryParams.toString()}`;

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
  // Load seafarer profile from API
  const loadSeafarerProfile = async () => {
    try {
      const response = await getMySeafarer();
      const ok = response.success ?? (response as any).successful;

      if (ok && response.data) {
        const seafarer: SeafarerDto = response.data;

        // Normalize gender value to match Select component options (lowercase)
        const normalizeGender = (gender: string | null | undefined): string => {
          if (!gender) return "Male";
          const normalized = gender.trim();
          const lowerGender = normalized.toLowerCase();

          // Check for exact matches (case-insensitive)
          if (lowerGender === "male") return "Male";
          if (lowerGender === "female") return "Female";
          if (lowerGender === "other") return "Other";

          // Default fallback
          return "Male";
        };

        console.log("API gender value:", seafarer.gender);
        const normalizedGender = normalizeGender(seafarer.gender);
        console.log("Normalized gender:", normalizedGender);

        // Update Personal Information from API
        const personalData: PersonalInfoData = {
          firstName: seafarer.firstName || "",
          lastName: seafarer.lastName || "",
          dateOfBirth: seafarer.dateOfBirth || "",
          gender: normalizedGender,
          nationality: seafarer.nationality || "",
          ninNumber: seafarer.ninNumber || "",
          sidNumber: seafarer.sidNumber || "",
          dischargeBookNo: seafarer.dischargeBookNo || "",
          currentRankId: seafarer.currentRankId || "",
          email: seafarer.email || userEmail || "",
          phoneNumber: seafarer.phoneNumber || "",
          homeAddress: seafarer.homeAddress || "",
          walletAddress: seafarer.walletAddress || "",
          nationalityId: seafarer.nationalityId || "",
          profilePictureUrl: seafarer.profilePictureUrl || "",
          profilePictureFile: null,
        };

        console.log("Setting personal info with gender:", personalData.gender);
        setPersonalInfo(personalData);

        // Set profile picture preview if URL exists
        if (seafarer.profilePictureUrl) {
          setProfilePicturePreview(seafarer.profilePictureUrl);
        }

        // Update Contact Details from API
        const contactData: ContactDetailsData = {
          email: seafarer.email || userEmail || "",
          phone: seafarer.phoneNumber || "",
          altPhone: "",
          whatsapp: "",
          city: "",
          state: "",
          country: seafarer.nationality || "",
          postalCode: "",
          address: seafarer.homeAddress || "",
        };
        setContactDetails(contactData);

        console.log("Loaded seafarer profile:", seafarer);
      } else {
        console.log(
          "Failed to load seafarer profile, falling back to localStorage",
        );
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Error loading seafarer profile:", error);
      // Fall back to localStorage if API call fails
      loadFromLocalStorage();
    }
  };

  // Load data from localStorage as fallback
  const loadFromLocalStorage = () => {
    if (!userEmail) {
      console.log("No user email available");
      return;
    }

    const personalKey = getStorageKey(userEmail, "personal");
    const contactKey = getStorageKey(userEmail, "contact");

    const savedPersonal = loadFromStorage<PersonalInfoData>(personalKey);
    const savedContact = loadFromStorage<ContactDetailsData>(contactKey);

    // Load Personal Information: prioritize localStorage, then user object, then empty
    if (savedPersonal) {
      console.log("Loading personal info from localStorage");
      setPersonalInfo(savedPersonal);
    } else if (user) {
      // Populate from user session if localStorage doesn't have saved data
      console.log("Loading personal info from user session");
      const personalData: PersonalInfoData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dateOfBirth: "",
        gender: "Male", // Default value
        nationality: "",
        ninNumber: "",
        sidNumber: "",
        dischargeBookNo: "",
        currentRankId: "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        homeAddress: "",
        walletAddress: "",
        nationalityId: "",
        profilePictureUrl: "",
        profilePictureFile: null,
      };
      setPersonalInfo(personalData);
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
      setContactDetails(contactData);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    if (!userEmail) {
      console.log("No user email available");
      return;
    }

    // Try to load from API first, fallback to localStorage
    loadSeafarerProfile();
    loadContactDetailsFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, user]);

  // Load contact details from API
  const loadContactDetailsFromAPI = async () => {
    try {
      const { getContactDetails } = await import("@/lib/services/profile-service");
      const response = await getContactDetails();
      const ok = response.success ?? (response as any).successful;
      
      if (ok && response.data) {
        const contact = response.data;
        const contactAny = contact as any;
        setContactDetails({
          email: contact.email || contactDetails.email || "",
          phone: contact.phone || contactDetails.phone || "",
          altPhone: contactAny.altPhone || (contactDetails as any).altPhone || "",
          whatsapp: contactAny.whatsapp || (contactDetails as any).whatsapp || "",
          city: contactAny.city || (contactDetails as any).city || "",
          state: contactAny.state || (contactDetails as any).state || "",
          country: contactAny.country || (contactDetails as any).country || "",
          postalCode: contactAny.postalCode || (contactDetails as any).postalCode || "",
          address: contact.address || contactDetails.address || "",
        });
      }
    } catch (error: any) {
      // Don't show error if contact details don't exist yet
      console.log("Contact details not found, using defaults");
    }
  };

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await getDocumentTypes();
        if (response.success ?? (response as any).successful) {
          const items = Array.isArray(response.data) ? response.data : [];
          setDocumentTypes(items);
        } else {
          toast.error(response.message || "Failed to fetch document types");
        }
      } catch (error: any) {
        console.error("Failed to fetch document types:", error);
        toast.error(error.message || "Failed to fetch document types");
      }
    };

    const fetchRanks = async () => {
      try {
        const result = await getRanks({ pageNumber: 1, pageSize: 100 });
        setRanks(result.items || []);
      } catch (error: any) {
        console.error("Failed to fetch ranks:", error);
        toast.error(error.message || "Failed to fetch ranks");
      }
    };

    const fetchNationalities = async () => {
      try {
        const items = await getNationalities();
        setNationalities(items || []);
      } catch (error: any) {
        console.error("Failed to fetch nationalities:", error);
        toast.error(error.message || "Failed to fetch nationalities");
      }
    };

    fetchDocumentTypes();
    fetchRanks();
    fetchNationalities();
    getUserDocuments();
  }, []);

  // Save Personal Information
  const handleSavePersonalInfo = async () => {
    if (!userEmail) {
      toast.error("Please log in to save your information");
      return;
    }

    // Validate required fields
    if (!personalInfo.firstName || !personalInfo.lastName) {
      toast.error("First Name and Last Name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data in PascalCase format for API
      const profileData = {
        FirstName: personalInfo.firstName.trim(),
        LastName: personalInfo.lastName.trim(),
        DateOfBirth: personalInfo.dateOfBirth || undefined,
        Gender: personalInfo.gender || undefined,
        Nationality: personalInfo.nationality.trim() || undefined,
        NinNumber: personalInfo.ninNumber.trim() || undefined,
        SidNumber: personalInfo.sidNumber.trim() || undefined,
        DischargeBookNo: personalInfo.dischargeBookNo.trim() || undefined,
        CurrentRankId: personalInfo.currentRankId || undefined,
        Email: personalInfo.email.trim() || undefined,
        PhoneNumber: personalInfo.phoneNumber.trim() || undefined,
        HomeAddress: personalInfo.homeAddress.trim() || undefined,
        WalletAddress: personalInfo.walletAddress.trim() || undefined,
        NationalityId: personalInfo.nationalityId || undefined,
      };

      const response = await createSeafarerProfile(
        profileData,
        personalInfo.profilePictureFile || undefined,
      );

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Personal information saved successfully!");
        // Reload the profile to get updated data
        await loadSeafarerProfile();
      } else {
        toast.error(response.message || "Failed to save personal information");
      }
    } catch (error: any) {
      console.error("Error saving personal information:", error);
      toast.error(
        error.message ||
          "Failed to save personal information. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Contact Details
  const handleSaveContactDetails = async () => {
    if (!userEmail) {
      toast.error("Please log in to save your information");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createOrUpdateContactDetails } = await import("@/lib/services/profile-service");
      const response = await createOrUpdateContactDetails({
        email: contactDetails.email || undefined,
        phone: contactDetails.phone || undefined,
        address: contactDetails.address || undefined,
        // Note: altPhone, whatsapp, city, state, country, postalCode are not part of the API
        // They are stored in local state but not sent to the backend
      } as any);
      
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Contact details saved successfully!");
        // Also save to localStorage as backup
        const key = getStorageKey(userEmail, "contact");
        saveToStorage(key, contactDetails);
      } else {
        toast.error(response.message || "Failed to save contact details");
      }
    } catch (error: any) {
      console.error("Error saving contact details:", error);
      toast.error(error.message || "Failed to save contact details");
    } finally {
      setIsSubmitting(false);
    }
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
      // Call the upload API using document-service
      const response = await uploadDocument(uploadFormData);

      const ok = response.success ?? (response as any).successful;
      if (ok) {
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
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {personalInfo.firstName?.[0] || ""}
                        {personalInfo.lastName?.[0] || ""}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profilePicture"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPersonalInfo({
                            ...personalInfo,
                            profilePictureFile: file,
                          });
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfilePicturePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() =>
                        document.getElementById("profilePicture")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
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
                    <Label htmlFor="lastName">Last Name *</Label>
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
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value) =>
                        setPersonalInfo({ ...personalInfo, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
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
                    <Label htmlFor="nationalityId">Nationality *</Label>
                    <Select
                      value={personalInfo.nationalityId}
                      onValueChange={(value) =>
                        setPersonalInfo({
                          ...personalInfo,
                          nationalityId: value,
                        })
                      }
                    >
                      <SelectTrigger id="nationalityId">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities.map((nat) => (
                          <SelectItem key={nat.id} value={nat.id}>
                            {nat.countryName || nat.isoCode3 || nat.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ninNumber">NIN Number</Label>
                    <Input
                      id="ninNumber"
                      value={personalInfo.ninNumber}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          ninNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidNumber">SID Number</Label>
                    <Input
                      id="sidNumber"
                      value={personalInfo.sidNumber}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          sidNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dischargeBookNo">Discharge Book No</Label>
                    <Input
                      id="dischargeBookNo"
                      value={personalInfo.dischargeBookNo}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          dischargeBookNo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentRankId">Current Rank *</Label>
                    <Select
                      value={personalInfo.currentRankId}
                      onValueChange={(value) =>
                        setPersonalInfo({
                          ...personalInfo,
                          currentRankId: value,
                        })
                      }
                    >
                      <SelectTrigger id="currentRankId">
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
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={personalInfo.phoneNumber}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="homeAddress">Home Address</Label>
                    <Textarea
                      id="homeAddress"
                      value={personalInfo.homeAddress}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          homeAddress: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={personalInfo.walletAddress}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          walletAddress: e.target.value,
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
                {Array.isArray(documents) && documents.length > 0 ? (
                  documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {doc.documentTypeName || doc.name || "Document"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileName || doc.name} • Uploaded{" "}
                            {formatDate(doc.createdAt)}
                            {}
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
                            handleDownloadDocument(
                              doc.id,
                              doc.fileName || doc.name || "document",
                              doc.fileUrl,
                            )
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm mt-2">
                      Click "Upload Document" to add your first document
                    </p>
                  </div>
                )}
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
                value={uploadFormData.documentTypeId || ""}
                onValueChange={(value) =>
                  setUploadFormData({
                    ...uploadFormData,
                    documentTypeId: value,
                  })
                }
              >
                <SelectTrigger id="documentTypeId">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type: DocumentTypeDto) => (
                    <SelectItem key={type.documentTypesId} value={type.documentTypesId}>
                      {type.description || "Unnamed Document"}
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
                          previewDocument?.fileName || "document",
                          previewDocument?.fileUrl,
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
                    previewDocument.fileName || "document",
                    previewDocument.fileUrl,
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
