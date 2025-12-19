"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  UserX,
  Users,
  GraduationCap,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, DataTableColumn } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";

interface Program {
  id: string;
  name: string;
  level: string;
  duration: string;
  enrolledStudents: number;
}

export default function MTIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalStudents: 480,
    courses: 23,
    graduates: 245,
  };

  const programs: Program[] = [
    {
      id: "1",
      name: "Deck Officer Certificate",
      level: "Advanced",
      duration: "18 months",
      enrolledStudents: 120,
    },
    {
      id: "2",
      name: "Marine Engineering",
      level: "Intermediate",
      duration: "24 months",
      enrolledStudents: 80,
    },
    {
      id: "3",
      name: "Navigation & Seamanship",
      level: "Basic",
      duration: "12 months",
      enrolledStudents: 154,
    },
    {
      id: "4",
      name: "Safety & Survival Training",
      level: "Basic",
      duration: "6 months",
      enrolledStudents: 120,
    },
  ];

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Advanced: "default",
      Intermediate: "secondary",
      Basic: "outline",
    };

    const colors: Record<string, string> = {
      Advanced: "bg-blue-100 text-blue-800",
      Intermediate: "bg-yellow-100 text-yellow-800",
      Basic: "bg-blue-50 text-blue-700",
    };

    return (
      <Badge variant={variants[level] || "default"} className={colors[level]}>
        {level}
      </Badge>
    );
  };

  const programColumns: DataTableColumn<Program>[] = [
    {
      id: "select",
      header: "",
      cell: () => <Checkbox />,
      className: "w-12",
    },
    {
      id: "name",
      header: "Program Name",
      accessorKey: "name",
    },
    {
      id: "level",
      header: "Level",
      cell: (row) => getLevelBadge(row.level),
    },
    {
      id: "duration",
      header: "Duration",
      accessorKey: "duration",
    },
    {
      id: "enrolledStudents",
      header: "Enrolled Students",
      accessorKey: "enrolledStudents",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Delta Maritime Academy</h1>
              <Badge variant="success" className="gap-1">
                <Users className="h-3 w-3" />
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Institute ID: INS-001
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <UserX className="mr-2 h-4 w-4" />
            Suspend
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduates</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Institute Information */}
            <Card>
              <CardHeader>
                <CardTitle>Institute Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Director/Lead Instructor
                  </p>
                  <p className="font-medium">Dr. Emmanuel Okonkwo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registration Date
                  </p>
                  <p className="font-medium">2020-05-10</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Contact Information
                  </p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        15 Marina Road, Victoria Island, Lagos, Lagos State
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">+234 801 234 5678</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href="mailto:info@deltamaritimeacademy.edu.ng"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        info@deltamaritimeacademy.edu.ng
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href="https://www.deltamaritimeacademy.edu.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        www.deltamaritimeacademy.edu.ng
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">+234 801 234 5678</p>
                </div>
              </CardContent>
            </Card>

            {/* Accreditation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Accreditation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-900">
                      Fully Accredited
                    </p>
                  </div>
                  <p className="text-sm text-green-800">
                    This institute meets all NIMASA requirements for maritime
                    training.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Accreditation Date
                  </p>
                  <p className="font-medium">2023-01-15</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">2026-01-15</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Audit</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium">2024-08-20</p>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Passed - All requirements met
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={programColumns}
                data={programs}
                searchable={false}
                selectable={true}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compliance details will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
