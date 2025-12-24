"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Building2,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  createTrainingInstitute,
  createMedicalInstitute,
} from "@/lib/services/institution-onboarding-service";
import {
  getInstitutions,
  type InstitutionDto,
} from "@/lib/services/institutions";
import { getRanks, type RankDto } from "@/lib/services/ranks";

type Step = "contacts" | "staff" | "training" | "medical";

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Step>("contacts");
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institutionType, setInstitutionType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [ranks, setRanks] = useState<RankDto[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState([
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
  const [staff, setStaff] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      staffType: "",
      medicalLicenseNo: "",
      nimasaAuthorizedExaminerId: "",
      specialization: "",
      imoModel609CertNo: "",
      highestCocHeldId: "",
      yearsOfSeaExperience: "",
      isActive: true,
    },
  ]);

  // Training Institute
  const [trainingData, setTrainingData] = useState({
    accreditationNumber: "",
    accreditationExpiry: "",
    coursesOffered: "",
    capacity: "",
    facilities: "",
  });

  // Medical Institute
  const [medicalData, setMedicalData] = useState({
    accreditationNumber: "",
    accreditationExpiry: "",
    servicesOffered: "",
    capacity: "",
    facilities: "",
  });

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

  useEffect(() => {
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
    loadInstitutions();
  }, []);

  useEffect(() => {
    const loadRanks = async () => {
      setIsLoadingRanks(true);
      try {
        const res = await getRanks({
          pageNumber: 1,
          pageSize: 100,
          sortDirection: "asc",
        });
        setRanks(res.items || []);
      } catch (error) {
        console.error("Failed to load ranks", error);
        toast.error("Failed to load ranks");
      } finally {
        setIsLoadingRanks(false);
      }
    };
    loadRanks();
  }, []);

  const handleContactSubmit = async () => {
    if (!institutionId) {
      toast.error("Please select an institution first");
      return;
    }
    try {
      setIsSubmitting(true);
      for (const contact of contacts) {
        if (contact.firstName && contact.lastName) {
          await addInstitutionContact(institutionId, contact);
        }
      }
      toast.success("Contacts added successfully");
      setActiveTab("staff");
    } catch (error) {
      toast.error("Failed to add contacts");
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
        medicalLicenseNo: "",
        nimasaAuthorizedExaminerId: "",
        specialization: "",
        imoModel609CertNo: "",
        highestCocHeldId: "",
        yearsOfSeaExperience: "",
        isActive: true,
      },
    ]);
  };

  const handleStaffSubmit = async () => {
    if (!institutionId) {
      toast.error("Please select an institution first");
      return;
    }
    const isTrainingInstitution = institutionType === "training";
    const isMedicalInstitution = institutionType === "medical";
    try {
      setIsSubmitting(true);
      for (const staffMember of staff) {
        if (staffMember.firstName && staffMember.lastName) {
          if (isMedicalInstitution && !staffMember.medicalLicenseNo) {
            toast.error(
              "Medical License No is required for medical institutions",
            );
            setIsSubmitting(false);
            return;
          }

          const payload = {
            institutionId,
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            email: staffMember.email,
            staffType: staffMember.staffType,
            isActive: staffMember.isActive,
            medicalLicenseNo: isMedicalInstitution
              ? staffMember.medicalLicenseNo || undefined
              : undefined,
            nimasaAuthorizedExaminerId: isMedicalInstitution
              ? staffMember.nimasaAuthorizedExaminerId || undefined
              : undefined,
            specialization: isMedicalInstitution
              ? staffMember.specialization || undefined
              : undefined,
            imoModel609CertNo: isTrainingInstitution
              ? staffMember.imoModel609CertNo || undefined
              : undefined,
            highestCocHeldId: isTrainingInstitution
              ? staffMember.highestCocHeldId || undefined
              : undefined,
            yearsOfSeaExperience: isTrainingInstitution
              ? Number(staffMember.yearsOfSeaExperience) || 0
              : undefined,
          };

          await addInstitutionStaff(payload);
        }
      }
      toast.success("Staff added successfully");
    } catch (error) {
      toast.error("Failed to add staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrainingSubmit = async () => {
    if (!institutionId) {
      toast.error("Please select an institution first");
      return;
    }
    try {
      setIsSubmitting(true);
      await createTrainingInstitute({
        institutionId,
        accreditationNumber: trainingData.accreditationNumber,
        accreditationExpiry: trainingData.accreditationExpiry,
        coursesOffered: trainingData.coursesOffered.split(","),
        capacity: parseInt(trainingData.capacity) || 0,
        facilities: trainingData.facilities.split(","),
      });
      toast.success("Training institute created successfully");
    } catch (error) {
      toast.error("Failed to create training institute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicalSubmit = async () => {
    if (!institutionId) {
      toast.error("Please select an institution first");
      return;
    }
    try {
      setIsSubmitting(true);
      await createMedicalInstitute({
        institutionId,
        accreditationNumber: medicalData.accreditationNumber,
        accreditationExpiry: medicalData.accreditationExpiry,
        servicesOffered: medicalData.servicesOffered.split(","),
        capacity: parseInt(medicalData.capacity) || 0,
        facilities: medicalData.facilities.split(","),
      });
      toast.success("Medical institute created successfully");
    } catch (error) {
      toast.error("Failed to create medical institute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTrainingInstitution = institutionType === "training";
  const isMedicalInstitution = institutionType === "medical";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Onboarding"
        description="Complete your institution setup"
      />

      <Card>
        <CardHeader>
          <CardTitle>Select Institution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Institution</Label>
            <Select
              value={institutionId || ""}
              onValueChange={(value) => {
                setInstitutionId(value);
                const selected = institutions.find((inst) => inst.id === value);
                setInstitutionType(
                  selected?.institutionType
                    ? selected.institutionType.toLowerCase()
                    : null,
                );
              }}
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/institutions")}
            >
              Go to Institutions
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/institution")}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Step)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          {/* <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger> */}
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Institution Contacts</CardTitle>
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
                        <Label>Job Title</Label>
                        <Input
                          value={contact.jobTitle}
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
                          value={contact.email}
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
                          value={contact.phoneNumberPrimary}
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
                          value={contact.phoneNumberSecondary}
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
                          value={contact.officeExtension}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].officeExtension = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={contact.isPrimaryContact}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].isPrimaryContact =
                              e.target.checked;
                            setContacts(newContacts);
                          }}
                        />
                        <Label>Primary Contact</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={contact.isActive}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].isActive = e.target.checked;
                            setContacts(newContacts);
                          }}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={handleContactSubmit} loading={isSubmitting}>
                Save Contacts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Institution Staff</CardTitle>
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
                          value={staffMember.firstName}
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
                          value={staffMember.lastName}
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
                          value={staffMember.email}
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
                          value={staffMember.staffType}
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index].staffType = e.target.value;
                            setStaff(newStaff);
                          }}
                        />
                      </div>
                      {isMedicalInstitution && (
                        <>
                          <div>
                            <Label>Medical License No *</Label>
                            <Input
                              value={staffMember.medicalLicenseNo}
                              onChange={(e) => {
                                const newStaff = [...staff];
                                newStaff[index].medicalLicenseNo =
                                  e.target.value;
                                setStaff(newStaff);
                              }}
                            />
                          </div>
                          <div>
                            <Label>NIMASA Authorized Examiner ID</Label>
                            <Input
                              value={staffMember.nimasaAuthorizedExaminerId}
                              onChange={(e) => {
                                const newStaff = [...staff];
                                newStaff[index].nimasaAuthorizedExaminerId =
                                  e.target.value;
                                setStaff(newStaff);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Specialization</Label>
                            <Input
                              value={staffMember.specialization}
                              onChange={(e) => {
                                const newStaff = [...staff];
                                newStaff[index].specialization = e.target.value;
                                setStaff(newStaff);
                              }}
                            />
                          </div>
                        </>
                      )}
                      {isTrainingInstitution && (
                        <>
                          <div>
                            <Label>IMO Model 609 Cert No</Label>
                            <Input
                              value={staffMember.imoModel609CertNo}
                              onChange={(e) => {
                                const newStaff = [...staff];
                                newStaff[index].imoModel609CertNo =
                                  e.target.value;
                                setStaff(newStaff);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Highest CoC Held</Label>
                            <Select
                              value={staffMember.highestCocHeldId}
                              onValueChange={(value) => {
                                const newStaff = [...staff];
                                newStaff[index].highestCocHeldId = value;
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
                              value={staffMember.yearsOfSeaExperience}
                              onChange={(e) => {
                                const newStaff = [...staff];
                                newStaff[index].yearsOfSeaExperience =
                                  e.target.value;
                                setStaff(newStaff);
                              }}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={staffMember.isActive}
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index].isActive = e.target.checked;
                            setStaff(newStaff);
                          }}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button onClick={handleStaffSubmit} loading={isSubmitting}>
                Save Staff
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Training Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Accreditation Number</Label>
                  <Input
                    value={trainingData.accreditationNumber}
                    onChange={(e) =>
                      setTrainingData({
                        ...trainingData,
                        accreditationNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Accreditation Expiry</Label>
                  <Input
                    type="date"
                    value={trainingData.accreditationExpiry}
                    onChange={(e) =>
                      setTrainingData({
                        ...trainingData,
                        accreditationExpiry: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Courses Offered (comma-separated)</Label>
                  <Input
                    value={trainingData.coursesOffered}
                    onChange={(e) =>
                      setTrainingData({
                        ...trainingData,
                        coursesOffered: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={trainingData.capacity}
                    onChange={(e) =>
                      setTrainingData({
                        ...trainingData,
                        capacity: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Facilities (comma-separated)</Label>
                  <Input
                    value={trainingData.facilities}
                    onChange={(e) =>
                      setTrainingData({
                        ...trainingData,
                        facilities: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleTrainingSubmit} loading={isSubmitting}>
                Save Training Institute
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Medical Institute Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Accreditation Number</Label>
                  <Input
                    value={medicalData.accreditationNumber}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        accreditationNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Accreditation Expiry</Label>
                  <Input
                    type="date"
                    value={medicalData.accreditationExpiry}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        accreditationExpiry: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Services Offered (comma-separated)</Label>
                  <Input
                    value={medicalData.servicesOffered}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        servicesOffered: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={medicalData.capacity}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        capacity: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Facilities (comma-separated)</Label>
                  <Input
                    value={medicalData.facilities}
                    onChange={(e) =>
                      setMedicalData({
                        ...medicalData,
                        facilities: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleMedicalSubmit} loading={isSubmitting}>
                Save Medical Institute
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
