"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Building2,
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Shield,
  Award,
  FileText,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";
import {
  getAdminStats,
  getPendingApplications,
  getAccreditationsUnderReview,
  type AdminStatsDto,
  type ApplicationDto,
  type AccreditationDto,
} from "@/lib/services/admin-review-service";
import { LoadingSpinner } from "@/components/shared";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [recentApplications, setRecentApplications] = useState<
    ApplicationDto[]
  >([]);
  const [recentAccreditations, setRecentAccreditations] = useState<
    AccreditationDto[]
  >([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load stats
      const statsResponse = await getAdminStats();
      if (statsResponse.success ?? (statsResponse as any).successful) {
        setStats(statsResponse.data || null);
      }

      // Load recent pending applications
      const appsResponse = await getPendingApplications({
        pageNumber: 1,
        pageSize: 5,
      });
      if (appsResponse.success ?? (appsResponse as any).successful) {
        setRecentApplications(appsResponse.data || []);
      }

      // Load recent accreditations under review
      const accredsResponse = await getAccreditationsUnderReview({
        pageNumber: 1,
        pageSize: 5,
      });
      if (accredsResponse.success ?? (accredsResponse as any).successful) {
        setRecentAccreditations(accredsResponse.data?.items || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
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
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "Admin"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your system administration dashboard
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pending Applications
                </p>
                <p className="text-3xl font-bold">
                  {stats?.pendingApplications || 0}
                </p>
                {stats && stats.newApplicationsLastWeek > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />+
                    {stats.newApplicationsLastWeek} this week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pending Accreditations
                </p>
                <p className="text-3xl font-bold">
                  {stats?.pendingAccreditations || 0}
                </p>
                <p className="text-xs text-muted-foreground">Requires review</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Seafarers</p>
                <p className="text-3xl font-bold">
                  {stats?.totalSeafarers?.toLocaleString() || 0}
                </p>
                {stats && stats.newSeafarersLastWeek > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />+
                    {stats.newSeafarersLastWeek} this week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Total Institutions
                </p>
                <p className="text-3xl font-bold">
                  {stats?.totalInstitutions?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.accreditedInstitutions || 0} accredited
                  {stats && stats.newInstitutionsLastWeek > 0 && (
                    <span className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />+
                      {stats.newInstitutionsLastWeek} this week
                    </span>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Building2 className="h-5 w-5" />
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/seafarer/applications">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <FileCheck className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Review Applications</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingApplications || 0} pending
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/admin/accreditations/review">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Award className="mr-3 h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Review Accreditations</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingAccreditations || 0} pending
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/seafarer/registry">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Users className="mr-3 h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Seafarer Registry</p>
                  <p className="text-xs text-muted-foreground">
                    Manage seafarers
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
                <Building2 className="mr-3 h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Manage Institutions</p>
                  <p className="text-xs text-muted-foreground">
                    View all institutions
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Applications and Accreditations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Applications</CardTitle>
            <Link href="/seafarer/applications">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/seafarer/applications/${app.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {app.seafarerName || "Unknown Seafarer"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {app.certificateName ||
                          app.documentName ||
                          "Application"}
                      </p>
                      {app.submittedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {formatDate(app.submittedAt)}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accreditations Under Review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Accreditations Under Review</CardTitle>
            <Link href="/admin/accreditations/review">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAccreditations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No accreditations under review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAccreditations.map((accred) => (
                  <Link
                    key={accred.id}
                    href={`/admin/accreditations/${accred.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {accred.institutionName || "Unknown Institution"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {accred.accreditationType || "Accreditation"}
                      </p>
                      {accred.submittedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {formatDate(accred.submittedAt)}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-orange-50">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Review
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Accredited Institutions
                </span>
                <span className="text-2xl font-bold">
                  {stats?.accreditedInstitutions || 0}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width:
                      stats && stats.totalInstitutions > 0
                        ? `${(stats.accreditedInstitutions / stats.totalInstitutions) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                of {stats?.totalInstitutions || 0} total institutions
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  New Seafarers (Week)
                </span>
                <span className="text-2xl font-bold text-green-600">
                  +{stats?.newSeafarersLastWeek || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {stats?.totalSeafarers?.toLocaleString() || 0} seafarers
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  New Applications (Week)
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  +{stats?.newApplicationsLastWeek || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingApplications || 0} pending review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



