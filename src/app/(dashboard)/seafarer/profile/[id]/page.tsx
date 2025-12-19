"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Download,
  Ship,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function SeafarerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const licenses = [
    {
      id: "1",
      name: "Certificate of Competency",
      type: "Master Mariner (Unlimited)",
      issuedBy: "NIMASA",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
    {
      id: "2",
      name: "GMDSS Radio Operator",
      type: "GOC",
      issuedBy: "NIMASA",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
    {
      id: "3",
      name: "Medical Certificate",
      type: "ENG 1",
      issuedBy: "Approved Medical Examiner",
      validUntil: "15 Jun 2025",
      status: "valid",
    },
  ];

  const stcwCertificates = [
    {
      id: "1",
      name: "STCW Basic Safety Training",
      issued: "15 Feb 2019",
      expiry: "15 Feb 2024",
      status: "expired",
    },
    {
      id: "2",
      name: "Medical First Aid",
      issued: "22 Aug 2021",
      expiry: "15 Feb 2024",
      status: "valid",
    },
    {
      id: "3",
      name: "Proficiency in Survival Craft",
      issued: "25 Aug 2021",
      expiry: "15 Feb 2024",
      status: "valid",
    },
    {
      id: "4",
      name: "Ship Security Officer",
      issued: "10 Mar 2022",
      expiry: "15 Feb 2024",
      status: "valid",
    },
  ];

  const employmentHistory = [
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
      period: "Jan 2022 - May 2023",
      isCurrent: false,
    },
    {
      id: "3",
      vessel: "MV Pacific Trader",
      company: "Pacific Shipping Ltd",
      vesselType: "Container Ship",
      rank: "Second Officer",
      period: "Jun 2020 - Dec 2021",
      isCurrent: false,
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <Badge variant="success" className="gap-1">
                    <User className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Master Mariner • CDC-2024-0001
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licenses">Licenses & Certificates</TabsTrigger>
          <TabsTrigger value="employment">Employment History</TabsTrigger>
          <TabsTrigger value="documents">Document</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">James Okonkwo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">15 Mar 1985</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">james.okonkwo@email.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">Nigerian</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">Male</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">+234 801 234 5678</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Place of Birth
                  </p>
                  <p className="font-medium">Lagos, Nigeria</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    15 Marina Road, Victoria Island, Lagos, Nigeria
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Badge Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Badge Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CDC Number</p>
                    <p className="font-medium">CDC-2024-0001</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Seaman Book Number
                    </p>
                    <p className="font-medium">SB-2020-45678</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Registration Date
                    </p>
                    <p className="font-medium">12 Mar 2020</p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">Mary Okonkwo</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Relationship
                    </p>
                    <p className="font-medium">Spouse</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+234 802 345 6789</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      15 Marina Road, Victoria Island, Lagos, Nigeria
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Current Assignment */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Assignment</CardTitle>
                <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
                  Assign to Shipping Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employmentHistory
                  .filter((emp) => emp.isCurrent)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Ship className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{assignment.vessel}</p>
                            <Badge variant="success">Currently Onboard</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.company}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Rank: {assignment.rank}
                            </span>
                            <span className="text-muted-foreground">
                              Vessel Type: {assignment.vesselType}
                            </span>
                            <span className="text-muted-foreground">
                              Sign On Date: {assignment.period.split(" - ")[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>See Trip History</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove from Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licenses & Certificates Tab */}
        <TabsContent value="licenses" className="space-y-6">
          {/* Licenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {licenses.map((license) => (
                  <div
                    key={license.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{license.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {license.type} • Issued by {license.issuedBy}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Valid Until {license.validUntil}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Valid</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* STCW Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                STCW Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stcwCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {cert.issued}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {cert.status === "valid" ? (
                            <>
                              <Badge variant="success">Valid</Badge>
                              <span className="text-sm text-muted-foreground">
                                Exp: {cert.expiry}
                              </span>
                            </>
                          ) : (
                            <>
                              <Badge variant="destructive">Expired</Badge>
                              <span className="text-sm text-muted-foreground">
                                Exp: {cert.expiry}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment History Tab */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sea Service Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employmentHistory.map((employment) => (
                  <div
                    key={employment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Ship className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{employment.vessel}</p>
                          {employment.isCurrent && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {employment.company}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employment.vesselType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{employment.rank}</p>
                      <p className="text-sm text-muted-foreground">
                        {employment.period}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
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
