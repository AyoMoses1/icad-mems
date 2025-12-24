"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared";
import { getSeafarers } from "@/lib/services/seafarers";
import { updateUserStatus } from "@/lib/services/user-service";
import type { UserProfileDto } from "@/types/seafarer";
import { formatDate, getInitials } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Active: { label: "Active", variant: "default" },
  Suspended: { label: "Suspended", variant: "destructive" },
  Expired: { label: "Expired", variant: "outline" },
  Pending: { label: "Pending", variant: "secondary" },
};

export default function SeafarerRegistryPage() {
  const [seafarers, setSeafarers] = useState<UserProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedSeafarer, setSelectedSeafarer] =
    useState<UserProfileDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 20;

  // Stats (would ideally come from a summary endpoint)
  const [stats, setStats] = useState({
    totalRegistered: 0,
    activeSeafarers: 0,
    pendingVerification: 0,
    expiredLicenses: 0,
  });

  useEffect(() => {
    loadSeafarers();
  }, [currentPage, searchQuery, statusFilter]);

  const loadSeafarers = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter !== "all" ? statusFilter : undefined;
      const response = await getSeafarers({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
        status,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSeafarers(response.data.items);
        const total = response.data.totalNumber ?? response.data.items.length;
        setTotalPages(
          response.data.pageSize
            ? Math.ceil(total / response.data.pageSize)
            : 1,
        );
        setTotalCount(total);

        // Calculate stats from current page data (ideal would be from separate endpoint)
        const activeCount = response.data.items.filter(
          (u) => u.currentStatus === "Active" || u.isActive,
        ).length;
        setStats((prev) => ({
          ...prev,
          totalRegistered: total,
          activeSeafarers: activeCount,
        }));
      } else {
        toast.error(response.message || "Failed to load seafarers");
      }
    } catch (error) {
      console.error("Error loading seafarers:", error);
      toast.error("Failed to load seafarers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedSeafarer) return;

    setIsSubmitting(true);
    try {
      const response = await updateUserStatus(selectedSeafarer.id || 0, {
        status: "Suspended",
        reason: "Suspended by administrator",
      });

      if (response.success) {
        toast.success("Seafarer suspended successfully");
        setIsSuspendDialogOpen(false);
        setSelectedSeafarer(null);
        loadSeafarers();
      } else {
        toast.error(response.message || "Failed to suspend seafarer");
      }
    } catch (error) {
      console.error("Error suspending seafarer:", error);
      toast.error("Failed to suspend seafarer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullName = (user: UserProfileDto) => {
    return (
      `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() ||
      "N/A"
    );
  };

  const columns: DataTableColumn<UserProfileDto>[] = [
    {
      id: "seafarer",
      header: "Seafarer",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(getFullName(row))}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{getFullName(row)}</p>
            <p className="text-sm text-muted-foreground">
              {row.email || "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "registrationNumber",
      header: "CDC Number",
      accessorKey: "registrationNumber",
      cell: (row) => (
        <span className="font-mono text-sm">
          {row.registrationNumber || `CDC-${row.id}`}
        </span>
      ),
    },
    {
      id: "userTypeName",
      header: "Rank",
      accessorKey: "userTypeName",
      cell: (row) => (
        <span className="text-sm">{row.userTypeName || "N/A"}</span>
      ),
    },
    {
      id: "currentStatus",
      header: "Status",
      accessorKey: "currentStatus",
      cell: (row) => {
        const status =
          row.currentStatus || (row.isActive ? "Active" : "Suspended");
        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "lastLoginAt",
      header: "Last Active",
      accessorKey: "lastLoginAt",
      cell: (row) => (
        <span className="text-sm">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : "Never"}
        </span>
      ),
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedSeafarer(row);
                setIsSuspendDialogOpen(true);
              }}
            >
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
                placeholder="Search seafarers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : seafarers.length === 0 ? (
            <EmptyState
              title="No seafarers found"
              description="There are no registered seafarers to display"
            />
          ) : (
            <DataTable
              columns={columns}
              data={seafarers}
              isLoading={isLoading}
              searchable={false}
              pageSize={pageSize}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={isSuspendDialogOpen}
        onOpenChange={setIsSuspendDialogOpen}
        title="Suspend Seafarer"
        description={`Are you sure you want to suspend ${selectedSeafarer ? getFullName(selectedSeafarer) : "this seafarer"}? This action cannot be undone.`}
        onConfirm={handleSuspend}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
