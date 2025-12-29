"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  TrendingUp,
  Filter,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertCircle,
} from "lucide-react";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAccreditationsUnderReview,
  getAdminStats,
  type AccreditationDto,
  type AdminStatsDto,
} from "@/lib/services/admin-review-service";
import { formatDate } from "@/lib/utils";

type StatusFilter =
  | "all"
  | "pending"
  | "under-review"
  | "approved"
  | "rejected"
  | "activated";

export default function AdminAccreditationsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [accreditations, setAccreditations] = useState<AccreditationDto[]>([]);
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load stats
      const statsResponse = await getAdminStats();
      if (statsResponse.success ?? (statsResponse as any).successful) {
        setStats(statsResponse.data || null);
      }

      // Load accreditations under review
      const res = await getAccreditationsUnderReview({
        pageNumber: 1,
        pageSize: 1000,
        sortDirection: "desc",
      });
      const ok = res.success ?? (res as any).successful;
      if (!ok) throw new Error(res.message || "Failed to load accreditations");
      setAccreditations(res.data?.items || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate statistics from accreditations
  const calculateStats = () => {
    const total = accreditations.length;
    const pending = accreditations.filter(
      (acc) => acc.status?.toLowerCase() === "pending" || !acc.status,
    ).length;
    const underReview = accreditations.filter(
      (acc) =>
        acc.status?.toLowerCase() === "under-review" ||
        acc.status?.toLowerCase() === "under_review" ||
        acc.reviewedAt === null,
    ).length;
    const approved = accreditations.filter(
      (acc) =>
        acc.status?.toLowerCase() === "approved" ||
        acc.status?.toLowerCase() === "active" ||
        acc.activatedAt !== null,
    ).length;
    const rejected = accreditations.filter(
      (acc) =>
        acc.status?.toLowerCase() === "rejected" ||
        acc.status?.toLowerCase() === "denied",
    ).length;
    const activated = accreditations.filter(
      (acc) => acc.activatedAt !== null,
    ).length;

    // Group by type
    const byType: Record<string, number> = {};
    accreditations.forEach((acc) => {
      const type = acc.accreditationType || "Unknown";
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      activated,
      byType,
    };
  };

  const statsData = calculateStats();

  // Filter accreditations
  const filteredAccreditations = accreditations.filter((acc) => {
    if (statusFilter === "all") {
      // Check type filter
      if (typeFilter !== "all" && acc.accreditationType !== typeFilter) {
        return false;
      }
      return true;
    }

    let matchesStatus = false;
    switch (statusFilter) {
      case "pending":
        matchesStatus =
          acc.status?.toLowerCase() === "pending" ||
          !acc.status ||
          !acc.submittedAt
            ? true
            : false;
        break;
      case "under-review":
        matchesStatus =
          acc.status?.toLowerCase() === "under-review" ||
          acc.status?.toLowerCase() === "under_review" ||
          (acc.submittedAt ? !acc.reviewedAt : false)
            ? true
            : false;
        break;
      case "approved":
        matchesStatus =
          acc.status?.toLowerCase() === "approved" ||
          acc.status?.toLowerCase() === "active" ||
          acc.reviewedAt !== null
            ? true
            : false;
        break;
      case "rejected":
        matchesStatus =
          acc.status?.toLowerCase() === "rejected" ||
          acc.status?.toLowerCase() === "denied"
            ? true
            : false;
        break;
      case "activated":
        matchesStatus = acc.activatedAt !== null ? true : false;
        break;
      default:
        matchesStatus = true;
    }

    if (!matchesStatus) return false;

    // Check type filter
    if (typeFilter !== "all" && acc.accreditationType !== typeFilter) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (acc: AccreditationDto) => {
    if (acc.activatedAt) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Activated
        </Badge>
      );
    }
    if (acc.reviewedAt && acc.status?.toLowerCase() === "approved") {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (
      acc.status?.toLowerCase() === "rejected" ||
      acc.status?.toLowerCase() === "denied"
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    if (acc.submittedAt && !acc.reviewedAt) {
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          <Clock className="mr-1 h-3 w-3" />
          Under Review
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        <AlertCircle className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  // Get unique accreditation types
  const accreditationTypes = Array.from(
    new Set(accreditations.map((acc) => acc.accreditationType).filter(Boolean)),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accreditations Dashboard"
        description="Manage and monitor all institution accreditation applications"
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Total Accreditations
                </p>
                <p className="text-3xl font-bold">{statsData.total}</p>
                {stats && stats.pendingAccreditations > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingAccreditations} pending review
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold">{statsData.underReview}</p>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Activated</p>
                <p className="text-3xl font-bold">{statsData.activated}</p>
                <p className="text-xs text-muted-foreground">
                  {statsData.approved} approved
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold">{statsData.rejected}</p>
                <p className="text-xs text-muted-foreground">
                  {statsData.pending} pending
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/accreditations/review">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Clock className="mr-3 h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Review Accreditations</p>
                  <p className="text-xs text-muted-foreground">
                    {statsData.underReview} pending review
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/institutions">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Building2 className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Manage Institutions</p>
                  <p className="text-xs text-muted-foreground">
                    View all institutions
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              onClick={loadData}
            >
              <RefreshCw className="mr-3 h-5 w-5 text-purple-600" />
              <div className="text-left">
                <p className="font-medium">Refresh Data</p>
                <p className="text-xs text-muted-foreground">Reload all data</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Accreditations List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Accreditations</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {accreditationTypes.length > 0 && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {accreditationTypes.map((type) => (
                    <SelectItem key={type} value={type || ""}>
                      {type || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAccreditations.length === 0 ? (
            <EmptyState
              title="No accreditations found"
              description={
                statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No accreditations have been submitted yet"
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredAccreditations.map((acc) => (
                <Link
                  key={acc.id}
                  href={`/admin/accreditations/${acc.id}`}
                  className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {acc.institutionName ||
                              acc.institutionId ||
                              "Unknown Institution"}
                          </p>
                          {getStatusBadge(acc)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {acc.accreditationType || "Accreditation"}
                        </p>
                        {acc.requestedServices &&
                          acc.requestedServices.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Services: {acc.requestedServices.join(", ")}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground md:grid-cols-4">
                      {acc.submittedAt && (
                        <div>
                          <span className="font-medium">Submitted:</span>{" "}
                          {formatDate(acc.submittedAt)}
                        </div>
                      )}
                      {acc.reviewedAt && (
                        <div>
                          <span className="font-medium">Reviewed:</span>{" "}
                          {formatDate(acc.reviewedAt)}
                        </div>
                      )}
                      {acc.finalizedAt && (
                        <div>
                          <span className="font-medium">Finalized:</span>{" "}
                          {formatDate(acc.finalizedAt)}
                        </div>
                      )}
                      {acc.activatedAt && (
                        <div>
                          <span className="font-medium">Activated:</span>{" "}
                          {formatDate(acc.activatedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:flex-col md:items-end">
                    <Button variant="ghost" size="sm">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accreditation Types Breakdown */}
      {Object.keys(statsData.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Accreditation Types Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(statsData.byType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
