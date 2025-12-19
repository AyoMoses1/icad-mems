"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface Seafarer {
  id: string;
  name: string;
  email: string;
  cdcNumber: string;
  rank: string;
  lastVessel: string;
  expiry: string;
  status: string;
}

export default function SeafarerRegistryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = {
    totalRegistered: 12450,
    activeSeafarers: 10823,
    pendingVerification: 156,
    expiredLicenses: 43,
  };

  const seafarers: Seafarer[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@gmail.com",
      cdcNumber: "CDC-2024-0001",
      rank: "Master Mariner",
      lastVessel: "MV Pacific Trader",
      expiry: "15 Jan 2024",
      status: "active",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john@gmail.com",
      cdcNumber: "CDC-2024-0002",
      rank: "Chief Engineer",
      lastVessel: "MV Pacific Trader",
      expiry: "15 Jan 2024",
      status: "active",
    },
    {
      id: "3",
      name: "John Doe",
      email: "john@gmail.com",
      cdcNumber: "CDC-2024-0003",
      rank: "Second Officer",
      lastVessel: "MV Pacific Trader",
      expiry: "15 Jan 2024",
      status: "active",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "destructive" | "warning"> = {
      active: "success",
      suspended: "destructive",
      expired: "warning",
    };

    const labels: Record<string, string> = {
      active: "Active",
      suspended: "Suspended",
      expired: "Expired",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const columns: DataTableColumn<Seafarer>[] = [
    {
      id: "seafarer",
      header: "Seafarer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {row.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "cdcNumber",
      header: "CDC Number",
      accessorKey: "cdcNumber",
    },
    {
      id: "rank",
      header: "Rank",
      accessorKey: "rank",
    },
    {
      id: "lastVessel",
      header: "Last Vessel",
      accessorKey: "lastVessel",
    },
    {
      id: "expiry",
      header: "Expiry",
      accessorKey: "expiry",
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
              <Link href={`/seafarer/profile/${row.id}`}>View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Suspend Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seafarer Registry"
        description="Manage and verify registered seafarers"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registered
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRegistered.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Seafarers
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeSeafarers.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verification
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingVerification}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expired Licenses
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredLicenses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Registered Seafarers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Seafarers</CardTitle>
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={seafarers}
            searchable={false}
            pageSize={20}
            totalCount={40}
            currentPage={1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
