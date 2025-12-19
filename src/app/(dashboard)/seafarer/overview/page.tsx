"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Users,
  Building2,
  ArrowUp,
  ArrowRight,
  MoreVertical,
  Ship,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SeafarerOverviewPage() {
  const [selectedTab, setSelectedTab] = useState("all");

  // Mock data
  const stats = {
    pendingApplications: 12,
    approvedThisMonth: 281,
    activeSeafarers: 1564,
    accreditedMTIs: 43,
    pendingMTIReview: 3,
  };

  const seafarers = [
    {
      id: "1",
      name: "John Abiodun",
      idNumber: "NIG-SF-2024-0001",
      rank: "Captain",
      status: "active",
    },
    {
      id: "2",
      name: "John Abiodun",
      idNumber: "NIG-SF-2024-0002",
      rank: "Chief Engineer",
      status: "suspended",
    },
    {
      id: "3",
      name: "John Abiodun",
      idNumber: "NIG-SF-2024-0003",
      rank: "Second Officer",
      status: "expired",
    },
    {
      id: "4",
      name: "John Abiodun",
      idNumber: "NIG-SF-2024-0004",
      rank: "Third Engineer",
      status: "active",
    },
  ];

  const institutions = [
    {
      id: "1",
      name: "Maritime Academy of Nigeria",
      location: "Oron, Akwa Ibom",
      courses: 15,
      students: 125,
      complianceRate: 85,
      status: "accredited",
      expiryDate: "6/15/2025",
    },
    {
      id: "2",
      name: "Maritime Academy of Nigeria",
      location: "Oron, Akwa Ibom",
      courses: 15,
      students: 125,
      complianceRate: 85,
      status: "accredited",
      expiryDate: "6/15/2025",
    },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "audit",
      title: "Follow up Audit",
      institution: "Lagos Maritime School",
      time: "2 mins ago",
    },
    {
      id: "2",
      type: "accreditation",
      title: "Initial Accreditation",
      institution: "West African Maritime Institute",
      time: "2 mins ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "destructive" | "warning"> = {
      active: "success",
      suspended: "destructive",
      expired: "warning",
      accredited: "success",
    };

    const labels: Record<string, string> = {
      active: "Active",
      suspended: "Suspended",
      expired: "Expired",
      accredited: "Accredited",
    };

    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seafarer Certification & License"
        description="Define and manage user roles and permissions"
        actions={
          <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
            <span className="mr-2">+</span>
            Add New Seafarer
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Application
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingApplications}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved this Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedThisMonth}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              +52 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Seafarers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSeafarers}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              +112 this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Accredited MTIs
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accreditedMTIs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingMTIReview} Pending review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seafarer Registry Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seafarer Registry</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seafarer/registry">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seafarers.map((seafarer) => (
              <div
                key={seafarer.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {seafarer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{seafarer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {seafarer.idNumber} • {seafarer.rank}
                    </p>
                  </div>
                </div>
                {getStatusBadge(seafarer.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institution Oversight Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Institution Oversight</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seafarer/miis">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {institutions.map((institution) => (
              <div
                key={institution.id}
                className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{institution.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {institution.location}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{institution.courses} Courses</span>
                      <span>{institution.students} Students</span>
                      <span>{institution.complianceRate}% Compliance rate</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    {institution.status === "accredited" && "✓"}
                    Accredited
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires: {institution.expiryDate}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Institute</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Suspend Institute
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.institution}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
