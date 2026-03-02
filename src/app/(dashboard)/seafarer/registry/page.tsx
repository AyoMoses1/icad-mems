"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
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
import { getAllOnboardings, type UserSeafarerOnboardingDto } from "@/lib/services/onboarding-service";
import {
  getSeafarerEmployments,
  type SeafarerEmploymentDto,
} from "@/lib/services/seafarer-employment-training-service";
import { updateUserStatus } from "@/lib/services/user-service";
import { formatDate, getInitials } from "@/lib/utils";

/** Unified row for the registry table: from onboarding (admin) or employment pool (employer) */
export interface RegistryRow {
  displayName: string;
  email?: string | null;
  rn: string;
  sin?: string | null;
  role: string;
  status: string;
  dateModified?: string | null;
  userId?: string | null;
  /** When true, row is from employer's employment pool (no suspend; profile link by RN) */
  isEmployerPool?: boolean;
}

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
  Signed: { label: "Signed", variant: "default" },
  Accepted: { label: "Accepted", variant: "default" },
  Rejected: { label: "Rejected", variant: "destructive" },
  Draft: { label: "Draft", variant: "secondary" },
  Sent: { label: "Sent", variant: "secondary" },
};

function mapOnboardingToRow(o: UserSeafarerOnboardingDto): RegistryRow {
  const status = o.isActive ? "Active" : (o.status || "Pending");
  return {
    displayName: o.contactDetails?.email ?? `User ${o.userId ?? "—"}`,
    email: o.contactDetails?.email ?? null,
    rn: o.rn ?? "",
    sin: o.sin ?? null,
    role: o.roleDescription ?? o.role ?? "N/A",
    status,
    dateModified: o.dateModified ?? o.updatedAt ?? null,
    userId: o.userId ?? null,
    isEmployerPool: false,
  };
}

/** Build unique pool seafarers from employments (one row per seafarerRN; use latest employment for display). */
function buildPoolRowsFromEmployments(employments: SeafarerEmploymentDto[]): RegistryRow[] {
  const byRn = new Map<string, SeafarerEmploymentDto>();
  for (const e of employments) {
    const rn = e.seafarerRN?.trim() || "";
    if (!rn) continue;
    const existing = byRn.get(rn);
    if (!existing || (e.dateCreated && existing.dateCreated && e.dateCreated > existing.dateCreated)) {
      byRn.set(rn, e);
    }
  }
  return Array.from(byRn.values()).map((e) => {
    const status =
      e.contractStatus === "Signed"
        ? "Signed"
        : e.acceptanceStatus === "Accepted"
          ? "Accepted"
          : e.acceptanceStatus === "Rejected"
            ? "Rejected"
            : e.contractStatus === "Sent"
              ? "Sent"
              : e.contractStatus === "Draft"
                ? "Draft"
                : e.acceptanceStatus ?? "Pending";
    return {
      displayName: e.seafarerFullName ?? e.seafarerRN ?? "—",
      email: null,
      rn: e.seafarerRN,
      sin: e.seafarerSIN ?? null,
      role: e.rankDescription ?? "N/A",
      status,
      dateModified: e.dateCreated ?? null,
      userId: null,
      isEmployerPool: true,
    };
  });
}

export default function SeafarerRegistryPage() {
  const [rows, setRows] = useState<RegistryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RegistryRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 20;

  const userRole =
    typeof window !== "undefined"
      ? localStorage.getItem("userRole")?.toUpperCase()
      : null;
  const isAdminRole = userRole === "ADMIN" || userRole === "SUPERADMIN";
  const isEmployerView = userRole === "AGENT" || userRole === "OWNER";
  const canModifySeafarers = isAdminRole;

  const [stats, setStats] = useState({
    totalRegistered: 0,
    activeSeafarers: 0,
    expiredLicenses: 0,
  });

  const loadSeafarers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isEmployerView) {
        // Employer: fetch only seafarers in this employer's pool (from employments)
        const allItems: SeafarerEmploymentDto[] = [];
        let page = 1;
        const size = 100;
        let totalPages = 1;
        do {
          const result = await getSeafarerEmployments({ pageNumber: page, pageSize: size });
          allItems.push(...(result.items ?? []));
          totalPages = result.totalPages ?? 1;
          page++;
        } while (page <= totalPages);
        const poolRows = buildPoolRowsFromEmployments(allItems);
        setRows(poolRows);
        const activeCount = poolRows.filter(
          (r) => r.status === "Signed" || r.status === "Accepted" || r.status === "Active"
        ).length;
        setStats({
          totalRegistered: poolRows.length,
          activeSeafarers: activeCount,
          expiredLicenses: 0,
        });
      } else {
        // Admin: all seafarers in the system (onboarding)
        const response = await getAllOnboardings();
        const ok = response.success ?? (response as { successful?: boolean }).successful;
        if (ok && response.data && Array.isArray(response.data)) {
          const seafarerOnly = response.data.filter(
            (o) => (o.role?.toUpperCase?.() ?? "") === "SEAFARER"
          );
          const mapped = seafarerOnly.map(mapOnboardingToRow);
          setRows(mapped);
          const activeCount = seafarerOnly.filter(
            (o) => (o.status?.toLowerCase?.() ?? "") === "approved" || o.isActive === true
          ).length;
          setStats({
            totalRegistered: seafarerOnly.length,
            activeSeafarers: activeCount,
            expiredLicenses: 0,
          });
        } else {
          setRows([]);
          setStats({ totalRegistered: 0, activeSeafarers: 0, expiredLicenses: 0 });
        }
      }
    } catch (error) {
      console.error("Error loading seafarers:", error);
      setRows([]);
      setStats({ totalRegistered: 0, activeSeafarers: 0, expiredLicenses: 0 });
      toast.error("Failed to load seafarers");
    } finally {
      setIsLoading(false);
    }
  }, [isEmployerView]);

  useEffect(() => {
    loadSeafarers();
  }, [loadSeafarers]);

  const handleSuspend = async () => {
    if (!selectedRow?.userId) return;

    setIsSubmitting(true);
    try {
      const userId =
        typeof selectedRow.userId === "string"
          ? parseInt(selectedRow.userId, 10)
          : selectedRow.userId;

      if (isNaN(userId)) {
        toast.error("Invalid user ID");
        return;
      }

      const response = await updateUserStatus(userId, {
        status: "Suspended",
        reason: "Suspended by administrator",
      });

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Seafarer suspended successfully");
        setIsSuspendDialogOpen(false);
        setSelectedRow(null);
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

  const q = (searchQuery ?? "").toLowerCase().trim();
  const statusNorm = (statusFilter !== "all" ? statusFilter : "").toLowerCase();
  const filtered = rows.filter((r) => {
    const matchSearch =
      !q ||
      (r.displayName ?? "").toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.rn ?? "").toLowerCase().includes(q) ||
      (r.sin ?? "").toLowerCase().includes(q) ||
      (r.userId ?? "").toLowerCase().includes(q);
    const matchStatus =
      !statusNorm ||
      (r.status?.toLowerCase?.() ?? "") === statusNorm ||
      (statusNorm === "active" &&
        (r.status === "Active" || r.status === "Signed" || r.status === "Accepted" || (r.status?.toLowerCase?.() ?? "") === "approved")) ||
      (statusNorm === "suspended" && (r.status?.toLowerCase?.() ?? "") === "suspended");
    return matchSearch && matchStatus;
  });
  const totalFiltered = filtered.length;
  const totalPagesComputed = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns: DataTableColumn<RegistryRow>[] = [
    {
      id: "seafarer",
      header: "Seafarer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(row.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {row.email || row.rn || "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "registrationNumber",
      header: "RN / SIN",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.rn || row.sin || "—"}
        </span>
      ),
    },
    {
      id: "role",
      header: isEmployerView ? "Rank" : "Role",
      cell: ({ row }) => (
        <span className="text-sm">{row.role}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "lastModified",
      header: "Last Active",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.dateModified ? formatDate(String(row.dateModified)) : "—"}
        </span>
      ),
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
              <Link href={row.rn ? `/seafarer/profile/${row.rn}` : "#"}>
                View Profile
              </Link>
            </DropdownMenuItem>
            {canModifySeafarers && row.userId && !row.isEmployerPool && (
              <>
                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedRow(row);
                    setIsSuspendDialogOpen(true);
                  }}
                >
                  Suspend Account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Seafarers"
        description={isEmployerView ? "Seafarers in your employment pool (employed by you)" : "Manage and view your seafarers"}
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
                {isEmployerView ? (
                  <>
                    <SelectItem value="Signed">Signed</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : paginated.length === 0 ? (
            <EmptyState
              title="No seafarers found"
              description="There are no registered seafarers to display"
            />
          ) : (
            <DataTable
              columns={columns}
              data={paginated}
              isLoading={isLoading}
              searchable={false}
              pageSize={pageSize}
              totalCount={totalFiltered}
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
        description={`Are you sure you want to suspend ${selectedRow?.displayName ?? "this seafarer"}? This action cannot be undone.`}
        onConfirm={handleSuspend}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
