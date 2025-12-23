"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Building2, GraduationCap, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  addInstitutionContact,
  addInstitutionStaff,
  createTrainingInstitute,
  createMedicalInstitute,
} from "@/lib/services/institution-onboarding-service";

type Step = "contacts" | "staff" | "training" | "medical";

export default function InstitutionOnboardingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Step>("contacts");
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      position: "",
      department: "",
      isPrimary: false,
    },
  ]);

  // Staff
  const [staff, setStaff] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      position: "",
      department: "",
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
        email: "",
        phoneNumber: "",
        position: "",
        department: "",
        isPrimary: false,
      },
    ]);
  };

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
        phoneNumber: "",
        position: "",
        department: "",
        isActive: true,
      },
    ]);
  };

  const handleStaffSubmit = async () => {
    if (!institutionId) {
      toast.error("Please select an institution first");
      return;
    }
    try {
      setIsSubmitting(true);
      for (const staffMember of staff) {
        if (staffMember.firstName && staffMember.lastName) {
          await addInstitutionStaff({
            ...staffMember,
            institutionId,
          });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Onboarding"
        description="Complete your institution setup"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Step)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
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
                        <Label>Position</Label>
                        <Input
                          value={contact.position}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].position = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input
                          value={contact.department}
                          onChange={(e) => {
                            const newContacts = [...contacts];
                            newContacts[index].department = e.target.value;
                            setContacts(newContacts);
                          }}
                        />
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
                        <Label>Phone Number</Label>
                        <Input
                          value={staffMember.phoneNumber}
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index].phoneNumber = e.target.value;
                            setStaff(newStaff);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={staffMember.position}
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index].position = e.target.value;
                            setStaff(newStaff);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input
                          value={staffMember.department}
                          onChange={(e) => {
                            const newStaff = [...staff];
                            newStaff[index].department = e.target.value;
                            setStaff(newStaff);
                          }}
                        />
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

