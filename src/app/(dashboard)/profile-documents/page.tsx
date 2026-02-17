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
import { getMySeafarer, type SeafarerDto } from "@/lib/services/seafarers";
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
import {
  getMyOnboarding,
  type UserSeafarerOnboardingDto,
  type ProfileDocumentDto,
  type VoyageActivityDto,
} from "@/lib/services/onboarding-service";

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
  emergencyContactPerson: string;
  relationship: string;
  emergencyContactNumber: string;
  emergencyContactAddress: string;
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
    emergencyContactPerson: "",
    relationship: "",
    emergencyContactNumber: "",
    emergencyContactAddress: "",
  });

  // SIN (Seafarer Identification Number) from onboarding
  const [onboardingSin, setOnboardingSin] = useState<string | null>(null);
  const [onboardingRn, setOnboardingRn] = useState<string | null>(null);

  // Sea service records from onboarding (voyageActivities)
  const [seaServiceRecords, setSeaServiceRecords] = useState<
    {
      id: string;
      vessel: string;
      company: string;
      vesselType: string;
      rank: string;
      period: string;
      isCurrent: boolean;
      seamanBookNo?: string;
      imoNumber?: string;
      flagState?: string;
      portOfEngagement?: string;
      portOfDischarge?: string;
      totalSeaTimeDays?: number;
      remarks?: string;
    }[]
  >([]);

  const uploadDocument = async (uploadData: UploadDocumentFormData) => {
    // Get RN from seafarer or user
    let rn: string | null = null;

    try {
      const seafarerResponse = await getMySeafarer();
      const seafarerOk =
        seafarerResponse.success ?? (seafarerResponse as any).successful;

      if (seafarerOk && seafarerResponse.data) {
        rn =
          (seafarerResponse.data as any).rn ||
          (seafarerResponse.data as any).registrationNumber ||
          null;
      }

      if (!rn) {
        const currentUser = useAuthStore.getState().user;
        rn =
          (currentUser as any)?.rn ||
          (currentUser as any)?.registrationNumber ||
          null;
      }

      if (!rn) {
        throw new Error(
          "Registration Number (RN) not found. Please complete onboarding first.",
        );
      }
    } catch (error) {
      console.error("Error getting RN:", error);
      throw new Error(
        "Failed to get registration number. Please complete onboarding first.",
      );
    }

    // Use document-service uploadProfileDocument
    const { uploadProfileDocument } =
      await import("@/lib/services/document-service");

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
      const seafarerOk =
        seafarerResponse.success ?? (seafarerResponse as any).successful;

      let rn: string | null = null;

      if (seafarerOk && seafarerResponse.data) {
        // Try to get RN from seafarer data
        const seafarer = seafarerResponse.data;
        rn =
          (seafarer as any).rn || (seafarer as any).registrationNumber || null;
      }

      // If no RN from seafarer, try to get from user
      if (!rn) {
        const currentUser = useAuthStore.getState().user;
        rn =
          (currentUser as any)?.rn ||
          (currentUser as any)?.registrationNumber ||
          null;
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

      // Use direct file URL - filePathOrUrl is relative (e.g. /documents/profile/RN/docId.png)
      const directUrl = fileUrl?.startsWith("http")
        ? fileUrl
        : fileUrl
          ? `${API_BASE_URL.replace(/\/$/, "")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
          : null;

      if (!directUrl) {
        throw new Error("Document URL is not available");
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(directUrl, {
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
      const fileUrl = document.fileUrl || document.filePathOrUrl;

      // Use direct file URL - filePathOrUrl is relative (e.g. /documents/profile/RN/docId.png)
      const directUrl = fileUrl?.startsWith("http")
        ? fileUrl
        : fileUrl
          ? `${API_BASE_URL.replace(/\/$/, "")}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
          : null;

      if (!directUrl) {
        toast.error("Document URL is not available for preview");
        return;
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(directUrl, {
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
  // Load onboarding data from my-onboarding API (contact, documents, sea service)
  const loadOnboardingData = async () => {
    try {
      const response = await getMyOnboarding();
      const ok = response.success ?? (response as any).successful;

      if (!ok || !response.data) return;

      const onboarding: UserSeafarerOnboardingDto = response.data;

      // SIN and RN from onboarding
      setOnboardingSin(onboarding.sin || null);
      setOnboardingRn(onboarding.rn || null);

      // Current Rank from onboarding - use currentRankId to look up display name from ranks
      if ((onboarding as any).currentRankId) {
        setPersonalInfo((prev) => ({
          ...prev,
          currentRankId: (onboarding as any).currentRankId,
        }));
      }

      // Contact Details from onboarding
      if (onboarding.contactDetails) {
        const c = onboarding.contactDetails;
        setContactDetails((prev) => ({
          ...prev,
          email: c.email || prev.email || "",
          phone: c.phone || prev.phone || "",
          address: c.address || prev.address || "",
          emergencyContactPerson: c.emergencyContactPerson || "",
          relationship: c.relationship || "",
          emergencyContactNumber: c.emergencyContactNumber || "",
          emergencyContactAddress: c.emergencyContactAddress || "",
        }));

        // Concatenate address data into Home Address (Personal Information)
        const addr = (c.address || "").trim();
        const emergAddr = (c.emergencyContactAddress || "").trim();
        const homeAddress =
          addr && emergAddr && addr === emergAddr
            ? addr
            : [addr, emergAddr].filter(Boolean).join("\n\n");
        if (homeAddress) {
          setPersonalInfo((prev) => ({ ...prev, homeAddress }));
        }
      }

      // Profile Documents from onboarding
      if (
        onboarding.profileDocuments &&
        onboarding.profileDocuments.length > 0
      ) {
        const mapped = onboarding.profileDocuments.map(
          (doc: ProfileDocumentDto) => ({
            id: doc.documentId,
            documentId: doc.documentId,
            documentTypeName: doc.documentTypeDescription || "Document",
            documentTypeDescription: doc.documentTypeDescription,
            fileUrl: doc.filePathOrUrl,
            fileName:
              doc.filePathOrUrl?.split("/").pop() ||
              doc.documentTypeDescription ||
              "document",
            createdAt: doc.dateCreated,
            dateCreated: doc.dateCreated,
          }),
        );
        setDocuments(mapped);
      } else if (onboarding.rn) {
        // Fallback: fetch profile documents by RN when onboarding has none
        try {
          const docRes = await getProfileDocuments(onboarding.rn);
          const ok = docRes.success ?? (docRes as any).successful;
          if (ok && docRes.data && Array.isArray(docRes.data)) {
            const mapped = docRes.data.map((d: any) => ({
              id: d.documentId || d.id,
              documentId: d.documentId || d.id,
              documentTypeName:
                d.documentTypeDescription || d.documentTypeName || "Document",
              documentTypeDescription: d.documentTypeDescription,
              fileUrl: d.filePathOrUrl || d.fileUrl,
              fileName:
                d.filePathOrUrl?.split("/").pop() || d.fileName || "document",
              createdAt: d.dateCreated || d.createdAt,
              dateCreated: d.dateCreated || d.createdAt,
            }));
            setDocuments(mapped);
          }
        } catch {
          // Ignore - keep empty
        }
      }

      // Sea Service from voyageActivities
      if (
        onboarding.voyageActivities &&
        onboarding.voyageActivities.length > 0
      ) {
        const records = onboarding.voyageActivities.map(
          (v: VoyageActivityDto) => {
            const dateJoined = v.dateJoined
              ? new Date(v.dateJoined).toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })
              : "";
            const dateLeft = v.dateLeft
              ? new Date(v.dateLeft).toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })
              : "";
            const period =
              dateJoined && dateLeft ? `${dateJoined} - ${dateLeft}` : "";
            const isCurrent = v.dateLeft
              ? new Date(v.dateLeft) >= new Date()
              : false;
            return {
              id:
                (v as any).logId ||
                v.voyageActivityId ||
                (v as any).voyageActivityId ||
                String(Math.random()),
              vessel: v.vesselName || "",
              company: v.operatorCompany || "",
              vesselType: v.flagState || "",
              rank: "",
              period,
              isCurrent,
              seamanBookNo: v.seamanBookNo ?? undefined,
              imoNumber: v.imoNumber ?? undefined,
              flagState: v.flagState ?? undefined,
              portOfEngagement: v.portOfEngagement ?? undefined,
              portOfDischarge: v.portOfDischarge ?? undefined,
              totalSeaTimeDays: v.totalSeaTimeDays ?? undefined,
              remarks: v.remarks ?? undefined,
            };
          },
        );
        setSeaServiceRecords(records);
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    }
  };

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

        // Update Personal Information from API (dateOfBirth from IMS userInfo, not seafarer)
        // currentRankId: prefer seafarer, fallback to existing (e.g. from onboarding)
        setPersonalInfo((prev) => {
          const personalData: PersonalInfoData = {
            firstName: seafarer.firstName || "",
            lastName: seafarer.lastName || "",
            dateOfBirth: (user as any)?.dateOfBirth || seafarer.dateOfBirth || "",
            gender: normalizedGender,
            nationality: seafarer.nationality || "",
            ninNumber: seafarer.ninNumber || "",
            sidNumber: seafarer.sidNumber || "",
            dischargeBookNo: seafarer.dischargeBookNo || "",
            currentRankId: seafarer.currentRankId || prev.currentRankId || "",
            email: seafarer.email || userEmail || "",
            phoneNumber: seafarer.phoneNumber || "",
            homeAddress: seafarer.homeAddress || "",
            walletAddress: seafarer.walletAddress || "",
            nationalityId: seafarer.nationalityId || "",
            profilePictureUrl: seafarer.profilePictureUrl || "",
            profilePictureFile: null,
          };

          console.log("Setting personal info with gender:", personalData.gender);
          return personalData;
        });

        // Set profile picture preview if URL exists
        if (seafarer.profilePictureUrl) {
          setProfilePicturePreview(seafarer.profilePictureUrl);
        }

        // Contact details come from my-onboarding (loadOnboardingData), not from seafarer profile
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
        dateOfBirth: (user as any).dateOfBirth || "",
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
        emergencyContactPerson: "",
        relationship: "",
        emergencyContactNumber: "",
        emergencyContactAddress: "",
      };
      setContactDetails(contactData);
    }
  };

  // Load profile data on mount - use my-onboarding as primary source for contact, documents, sea service
  useEffect(() => {
    if (!userEmail) {
      console.log("No user email available");
      return;
    }

    loadOnboardingData();
    loadSeafarerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, user]);

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
      const { createOrUpdateContactDetails } =
        await import("@/lib/services/profile-service");
      const response = await createOrUpdateContactDetails({
        email: contactDetails.email || undefined,
        phone: contactDetails.phone || undefined,
        address: contactDetails.address || undefined,
        emergencyContactPerson:
          contactDetails.emergencyContactPerson || undefined,
        relationship: contactDetails.relationship || undefined,
        emergencyContactNumber:
          contactDetails.emergencyContactNumber || undefined,
        emergencyContactAddress:
          contactDetails.emergencyContactAddress || undefined,
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

        // Refresh data from my-onboarding
        await loadOnboardingData();
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
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  {(onboardingRn || onboardingSin) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {onboardingRn && <span>RN: {onboardingRn}</span>}
                      {onboardingRn && onboardingSin && " · "}
                      {onboardingSin && <span>SIN: {onboardingSin}</span>}
                    </p>
                  )}
                </div>
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
                      value={"Nigeria"}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          nationality: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* <div className="space-y-2">
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
                  </div> */}

                  {/* <div className="space-y-2">
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
                  </div> */}
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
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPerson">
                        Emergency Contact Person
                      </Label>
                      <Input
                        id="emergencyContactPerson"
                        value={contactDetails.emergencyContactPerson}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
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
                        value={contactDetails.relationship}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
                            relationship: e.target.value,
                          })
                        }
                        placeholder="e.g. Spouse, Parent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactNumber">
                        Emergency Contact Number
                      </Label>
                      <Input
                        id="emergencyContactNumber"
                        value={contactDetails.emergencyContactNumber}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
                            emergencyContactNumber: e.target.value,
                          })
                        }
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergencyContactAddress">
                        Emergency Contact Address
                      </Label>
                      <Textarea
                        id="emergencyContactAddress"
                        value={contactDetails.emergencyContactAddress}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
                            emergencyContactAddress: e.target.value,
                          })
                        }
                        placeholder="Full address"
                        rows={2}
                      />
                    </div>
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
                {seaServiceRecords.length > 0 ? (
                  seaServiceRecords.map((record) => (
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
                            <h3 className="font-semibold">
                              {record.vessel || "Vessel"}
                            </h3>
                            {record.isCurrent && (
                              <Badge variant="success">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {record.company}
                          </p>
                          {record.flagState && (
                            <p className="text-sm text-muted-foreground">
                              Flag: {record.flagState}
                              {record.imoNumber &&
                                ` • IMO: ${record.imoNumber}`}
                            </p>
                          )}
                          {(record.portOfEngagement ||
                            record.portOfDischarge) && (
                            <p className="text-sm text-muted-foreground">
                              {record.portOfEngagement &&
                                `From: ${record.portOfEngagement}`}
                              {record.portOfEngagement &&
                                record.portOfDischarge &&
                                " → "}
                              {record.portOfDischarge &&
                                `To: ${record.portOfDischarge}`}
                            </p>
                          )}
                          {record.totalSeaTimeDays != null && (
                            <p className="text-sm text-muted-foreground">
                              Sea time: {record.totalSeaTimeDays} days
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{record.period}</p>
                        {record.seamanBookNo && (
                          <p className="text-sm text-muted-foreground">
                            Seaman Book: {record.seamanBookNo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sea service records yet</p>
                    <p className="text-sm mt-2">
                      Sea service records from your onboarding will appear here
                    </p>
                  </div>
                )}
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
                    <SelectItem
                      key={type.documentTypesId}
                      value={type.documentTypesId}
                    >
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
