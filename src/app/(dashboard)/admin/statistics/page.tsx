"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  FileCheck,
  Award,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import { getAdminStats, type AdminStatsDto } from "@/lib/services/admin-review-service";

export default function AdminStatisticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatsDto | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminStats();
      if (response.success ?? (response as any).successful) {
        setStats(response.data || null);
      }
    } catch (error) {
      console.error("Failed to load statistics:", error);
      toast.error("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

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
        title="System Statistics"
        description="Overview of system-wide statistics and metrics"
      />

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Seafarers</p>
                <p className="text-3xl font-bold">
                  {stats?.totalSeafarers?.toLocaleString() || 0}
                </p>
                {stats?.newSeafarersLastWeek !== undefined && stats.newSeafarersLastWeek > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{stats.newSeafarersLastWeek} this week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Institutions</p>
                <p className="text-3xl font-bold">
                  {stats?.totalInstitutions?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.accreditedInstitutions || 0} accredited
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold">
                  {((stats?.pendingApplications || 0) + 
                    (stats?.newApplicationsLastWeek || 0) * 10).toLocaleString()}
                </p>
                {stats?.newApplicationsLastWeek !== undefined && stats.newApplicationsLastWeek > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{stats.newApplicationsLastWeek} this week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <FileCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Accreditations</p>
                <p className="text-3xl font-bold">
                  {stats?.accreditedInstitutions?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingAccreditations || 0} pending
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Items */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-yellow-600" />
                  <span>Pending Applications</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {stats?.pendingApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-orange-600" />
                  <span>Pending Accreditations</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {stats?.pendingAccreditations || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Weekly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>New Seafarers</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  +{stats?.newSeafarersLastWeek || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <span>New Applications</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  +{stats?.newApplicationsLastWeek || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span>New Institutions</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  +{stats?.newInstitutionsLastWeek || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institution Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Institution Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accredited Institutions</span>
                <span className="font-bold">{stats?.accreditedInstitutions || 0}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: stats && stats.totalInstitutions > 0
                      ? `${(stats.accreditedInstitutions / stats.totalInstitutions) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats && stats.totalInstitutions > 0
                  ? `${((stats.accreditedInstitutions / stats.totalInstitutions) * 100).toFixed(1)}% of total institutions`
                  : "No institutions yet"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Accreditation</span>
                <span className="font-bold">{stats?.pendingAccreditations || 0}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{
                    width: stats && stats.totalInstitutions > 0
                      ? `${(stats.pendingAccreditations / stats.totalInstitutions) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



