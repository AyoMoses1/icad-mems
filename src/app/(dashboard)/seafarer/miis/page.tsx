"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
  Plus,
  Eye,
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
import {
  getOrganizations,
  getOrganizationAccreditations,
} from "@/lib/services/organization-service";
import {
  getAllAccreditations,
  updateInstitutionAccreditationStatus,
} from "@/lib/services/accreditation-service";
import type { UserOrganizationDto } from "@/types/seafarer";

// Define AccreditationDto locally since it's not exported from seafarer types
interface AccreditationDto {
  id: string;
  institutionId?: string;
  status?: string;
  accreditationType?: string;
  effectiveDate?: string;
  expiryDate?: string;
  notes?: string;
}
import { formatDate } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Active: { label: "Active", variant: "default" },
  Approved: { label: "Approved", variant: "default" },
  Expired: { label: "Expired", variant: "destructive" },
  Suspended: { label: "Suspended", variant: "outline" },
  Pending: { label: "Pending", variant: "secondary" },
};

export default function AccreditedMTIsPage() {
  const [organizations, setOrganizations] = useState<UserOrganizationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<UserOrganizationDto | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 20;

  // Stats
  const [stats, setStats] = useState({
    totalInstitutes: 0,
    accredited: 0,
    pendingReview: 0,
    suspended: 0,
  });

  useEffect(() => {
    loadOrganizations();
  }, [currentPage, searchQuery, statusFilter]);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      // First try to get organizations, then we can also get accreditations
      const orgResponse = await getOrganizations({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
        isActive:
          statusFilter !== "suspended"
            ? statusFilter === "all"
              ? undefined
              : true
            : false,
      });

      if (orgResponse.success && orgResponse.data) {
        setOrganizations(orgResponse.data.items);
        setTotalPages(orgResponse.data.totalPages);
        setTotalCount(orgResponse.data.totalCount);

        // Also fetch accreditations to get accurate stats
        const accredResponse = await getAllAccreditations({
          pageNumber: 1,
          pageSize: 100, // Get all for stats
        });

        if (accredResponse.success && accredResponse.data) {
          // Handle response data which could be array or paginated response
          const responseData = accredResponse.data as any;
          const accreditations: AccreditationDto[] = Array.isArray(responseData)
            ? responseData
            : responseData?.items || [];
          const totalCount = responseData?.totalCount || accreditations.length;
          
          setStats({
            totalInstitutes: totalCount,
            accredited: accreditations.filter(
              (a: AccreditationDto) =>
                a.status === "Approved" || a.status === "Active"
            ).length,
            pendingReview: accreditations.filter(
              (a: AccreditationDto) => a.status === "Pending"
            ).length,
            suspended: accreditations.filter(
              (a: AccreditationDto) => a.status === "Suspended"
            ).length,
          });
        }
      } else {
        toast.error(orgResponse.message || "Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedOrg) return;

    // Find the accreditation for this organization
    try {
      const accredResponse = await getOrganizationAccreditations(
        selectedOrg.id
      );
      if (
        accredResponse.success &&
        accredResponse.data &&
        accredResponse.data.length > 0
      ) {
        const accreditationId = (accredResponse.data[0] as any).id;

        setIsSubmitting(true);
        const response = await updateInstitutionAccreditationStatus(accreditationId, {
          status: "Suspended",
          notes: "Suspended by administrator",
        });

        const ok = response.success ?? (response as any).successful;
        if (ok) {
          toast.success("Institution suspended successfully");
          setIsSuspendDialogOpen(false);
          setSelectedOrg(null);
          loadOrganizations();
        } else {
          toast.error(response.message || "Failed to suspend institution");
        }
      } else {
        toast.error("No accreditation found for this organization");
      }
    } catch (error) {
      console.error("Error suspending institution:", error);
      toast.error("Failed to suspend institution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocation = (org: UserOrganizationDto) => {
    const parts = [org.city, org.state, org.country].filter(Boolean);
    return parts.join(", ") || "N/A";
  };

  const columns: DataTableColumn<UserOrganizationDto>[] = [
    {
      id: "name",
      header: "Institute",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.name || "N/A"}</p>
          {row.registrationNumber && (
            <p className="text-sm text-muted-foreground">
              {row.registrationNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "organizationTypeName",
      header: "Type",
      accessorKey: "organizationTypeName",
      cell: ({ row }) => (
        <span className="text-sm">{row.organizationTypeName || "N/A"}</span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm">{getLocation(row)}</span>,
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: ({ row }) => {
        const status = row.isActive ? "Active" : "Suspended";
        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/seafarer/miis/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Institute
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedOrg(row);
                setIsSuspendDialogOpen(true);
              }}
            >
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
          <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]" asChild>
            <Link href="/seafarer/miis/add">
              <Plus className="mr-2 h-4 w-4" />
              Add New Institute
            </Link>
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
                placeholder="Search institutes..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : organizations.length === 0 ? (
            <EmptyState
              title="No institutes found"
              description="There are no accredited institutes to display"
            />
          ) : (
            <DataTable
              columns={columns}
              data={organizations}
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
        title="Suspend Institution"
        description={`Are you sure you want to suspend ${selectedOrg?.name || "this institution"}? This action cannot be undone.`}
        confirmLabel="Suspend"
        cancelLabel="Cancel"
        onConfirm={handleSuspend}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

