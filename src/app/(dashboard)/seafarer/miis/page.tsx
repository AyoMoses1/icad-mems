"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableColumn } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";

interface MTI {
  id: string;
  name: string;
  type: string;
  location: string;
  students: number;
  courses: number;
  status: string;
}

export default function AccreditedMTIsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = {
    totalInstitutes: 48,
    accredited: 23,
    pendingReview: 8,
    suspended: 3,
  };

  const mtiList: MTI[] = [
    {
      id: "1",
      name: "Maritime Academy of the Philippines",
      type: "Academy",
      location: "Manila, Philippines",
      students: 120,
      courses: 12,
      status: "active",
    },
    {
      id: "2",
      name: "Asian Institute of Maritime Studies",
      type: "Institute",
      location: "Manila, Philippines",
      students: 80,
      courses: 8,
      status: "active",
    },
    {
      id: "3",
      name: "Philippine Merchant Marine Academy",
      type: "University",
      location: "Manila, Philippines",
      students: 154,
      courses: 15,
      status: "expired",
    },
    {
      id: "4",
      name: "MAAP - Maritime Academy of Asia and the Pacific",
      type: "Training Center",
      location: "Manila, Philippines",
      students: 120,
      courses: 10,
      status: "active",
    },
    {
      id: "5",
      name: "John B. Lacson Foundation Maritime University",
      type: "Academy",
      location: "Manila, Philippines",
      students: 114,
      courses: 14,
      status: "active",
    },
    {
      id: "6",
      name: "Davao Merchant Marine Academy",
      type: "Institute",
      location: "Manila, Philippines",
      students: 88,
      courses: 8,
      status: "active",
    },
    {
      id: "7",
      name: "Cebu Maritime Training Center",
      type: "Academy",
      location: "Manila, Philippines",
      students: 142,
      courses: 12,
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            Expired
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="warning" className="gap-1">
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  const columns: DataTableColumn<MTI>[] = [
    {
      id: "select",
      header: "",
      cell: () => <Checkbox />,
      className: "w-12",
    },
    {
      id: "name",
      header: "Institute",
      accessorKey: "name",
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
    },
    {
      id: "location",
      header: "Location",
      accessorKey: "location",
    },
    {
      id: "students",
      header: "Students",
      accessorKey: "students",
    },
    {
      id: "courses",
      header: "Courses",
      accessorKey: "courses",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/seafarer/miis/${row.id}`}>View Institute</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Suspend Institute
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute Accreditation"
        description="Manage maritime training institutes and accreditation status"
        actions={
          <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
            <Plus className="mr-2 h-4 w-4" />
            Add New Institute
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Institutes
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstitutes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accredited</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accredited}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accredited Institutes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accredited Institutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={mtiList}
            searchable={false}
            selectable={true}
            pageSize={20}
            totalCount={40}
            currentPage={1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
