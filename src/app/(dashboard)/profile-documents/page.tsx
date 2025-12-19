"use client";

import { useState } from "react";
import {
  Edit,
  Download,
  Ship,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  FileText,
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

export default function ProfileDocumentsPage() {
  const [activeTab, setActiveTab] = useState("personal");

  const documents = [
    {
      id: "1",
      name: "Passport Copy",
      type: "PDF",
      uploadedDate: "15 Jan 2023",
    },
    {
      id: "2",
      name: "CDC Document",
      type: "PDF",
      uploadedDate: "15 Jan 2023",
    },
    {
      id: "3",
      name: "Medical Certificate",
      type: "PDF",
      uploadedDate: "15 Jan 2023",
    },
    {
      id: "4",
      name: "STCW Certificates Bundle",
      type: "PDF",
      uploadedDate: "15 Jan 2023",
    },
    {
      id: "5",
      name: "COC Certificate",
      type: "PDF",
      uploadedDate: "15 Jan 2023",
    },
  ];

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
                    <Input id="firstName" defaultValue="David" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" defaultValue="David" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Preferred Username</Label>
                    <Input id="username" defaultValue="joe_d" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select defaultValue="male">
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
                    <Input id="nationality" defaultValue="Nigerian" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" placeholder="Select Date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seafarerId">Seafarer ID</Label>
                    <Input
                      id="seafarerId"
                      defaultValue="458795654PL"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
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
                      defaultValue="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+234 800 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="altPhone">Alternative Phone Number</Label>
                    <Input id="altPhone" defaultValue="+234 000 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Whatsapp Number</Label>
                    <Input id="whatsapp" defaultValue="+234 000 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue="Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" defaultValue="Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="Nigeria" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" defaultValue="101001" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-10"
                      defaultValue="15 Marina Road, Victoria Island, Lagos"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
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
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • Uploaded {doc.uploadedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  );
}


