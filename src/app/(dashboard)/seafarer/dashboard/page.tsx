"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  GraduationCap,
  LifeBuoy,
  Ship,
  AlertCircle,
  Clock,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getApplicationDashboard,
  getMyApplications,
  type ApplicationDashboardDto,
  type ApplicationDto,
} from "@/lib/services/application-service";
import { formatDate } from "@/lib/utils";

interface ExpiringDocument {
  documentType: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface DashboardNotification {
  message: string;
  timestamp: string;
  type: string;
}

export default function SeafarerDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ApplicationDashboardDto | null>(null);
  const [recentApplications, setRecentApplications] = useState<ApplicationDto[]>([]);
  
  // Check if onboarding is complete
  const isOnboardingComplete = user?.is_onboarding_complete ?? false;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load dashboard summary
      const dashboardResponse = await getApplicationDashboard();
      const dashboardOk = dashboardResponse.success ?? (dashboardResponse as any).successful;
      
      if (dashboardOk && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }

      // Load recent applications
      const applicationsResponse = await getMyApplications();
      const appsOk = applicationsResponse.success ?? (applicationsResponse as any).successful;
      
      if (appsOk && applicationsResponse.data) {
        // Get the 5 most recent applications
        const apps = Array.isArray(applicationsResponse.data) 
          ? applicationsResponse.data.slice(0, 5) 
          : [];
        setRecentApplications(apps);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeaTime = () => {
    const d = dashboardData;
    if (d?.totalSeaTimeDays == null || d.totalSeaTimeDays === 0) {
      return "No sea time recorded";
    }
    const years = d.totalSeaTimeYears ?? 0;
    const months = d.totalSeaTimeMonths ?? 0;
    const days = d.totalSeaTimeDays ?? 0;
    const parts: string[] = [];
    if (years > 0)
      parts.push(
        `${years.toFixed(1)} year${years !== 1 ? "s" : ""}`
      );
    if (months > 0)
      parts.push(
        `${months.toFixed(1)} month${months !== 1 ? "s" : ""}`
      );
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "No sea time recorded";
  };

  const getStatusBadge = (status?: string | null) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "APPROVED":
      case "COMPLETED":
        return <Badge variant="secondary" className="bg-green-50 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="secondary" className="bg-red-50 text-red-700">Rejected</Badge>;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Under Review</Badge>;
      case "PAYMENT_PENDING":
      case "PEND_PAY":
        return <Badge variant="secondary" className="bg-orange-50 text-orange-700">Payment Pending</Badge>;
      case "PAID":
        return <Badge variant="secondary" className="bg-cyan-50 text-cyan-700">Paid</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-50 text-gray-700">{status || "Draft"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Seafarer Dashboard</h1>
        <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "Seafarer"}. Track your applications,
            services, and account status at a glance.
        </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadDashboardData}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">
                {isLoading ? "-" : (dashboardData?.totalApplications ?? 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold">
                {isLoading ? "-" : ((dashboardData?.submittedApplications ?? 0) + (dashboardData?.underReviewApplications ?? 0))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payment Pending</p>
              <p className="text-3xl font-bold">
                {isLoading ? "-" : (dashboardData?.paymentPendingApplications ?? dashboardData?.pendingPayments ?? 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold">
                {isLoading ? "-" : ((dashboardData?.approvedApplications ?? 0) + (dashboardData?.completedApplications ?? 0))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Sea Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-sky-600" />
            Total Sea Time
          </CardTitle>
          <CardDescription>
            Calculated from your voyage activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Days</p>
              <p className="text-2xl font-bold">
                {isLoading ? "-" : (dashboardData?.totalSeaTimeDays ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Months</p>
              <p className="text-2xl font-bold">
                {isLoading
                  ? "-"
                  : (dashboardData?.totalSeaTimeMonths?.toFixed(1) ?? "0.0")}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Years</p>
              <p className="text-2xl font-bold">
                {isLoading
                  ? "-"
                  : (dashboardData?.totalSeaTimeYears?.toFixed(1) ?? "0.0")}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatSeaTime()}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Show onboarding card only if not complete */}
        {!isOnboardingComplete && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Complete Your Onboarding
              </CardTitle>
              <CardDescription>
                You need to complete your onboarding to access all services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  Please complete your profile information, contact details,
                  education history, and upload required documents to get
                  started.
                </p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                asChild
              >
                <Link href="/onboarding">
                  Start Onboarding Process
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show onboarding complete card if complete */}
        {isOnboardingComplete && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Onboarding Complete
              </CardTitle>
              <CardDescription>
                Your onboarding has been completed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Personal Information", status: "Completed" },
                { label: "Identity Documents", status: "Completed" },
                { label: "Sea Service Records", status: "Completed" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                title: "Apply for Service",
                href: "/seafarer/services",
                icon: FileText,
                description: "Start a new application",
              },
              { 
                title: "View Applications", 
                href: "/seafarer/applications", 
                icon: ClipboardList,
                description: "Track your applications",
              },
              { 
                title: "My Invoices", 
                href: "/invoices/my-invoices", 
                icon: CreditCard,
                description: "View and pay invoices",
              },
              { 
                title: "Profile & Documents", 
                href: "/profile-documents", 
                icon: LifeBuoy,
                description: "Manage your profile",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                  <span className="text-sm font-medium">{item.title}</span>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/seafarer/applications">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications yet</p>
                <Link href="/seafarer/services">
                  <Button className="mt-4" variant="outline">
                    Create Your First Application
                  </Button>
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id || app.applicationId} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{app.serviceName || "Application"}</p>
                      {getStatusBadge(app.status || app.applicationStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {app.createdAt || app.dateCreated
                        ? formatDate(app.createdAt || app.dateCreated || "")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold">{dashboardData?.totalInvoices ?? 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending Invoices</p>
                    <p className="text-2xl font-bold">{dashboardData?.pendingInvoices ?? 0}</p>
                  </div>
                </div>
                
                {(dashboardData?.totalAmountOwed ?? 0) > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Amount Due</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800 mt-2">
                      ₦{(dashboardData?.totalAmountOwed ?? 0).toLocaleString()}
                    </p>
                    <Link href="/invoices/my-invoices">
                      <Button className="mt-3 w-full" variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </Link>
                  </div>
                )}

                {(dashboardData?.totalAmountPaid ?? 0) > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">Total Paid</p>
                    <p className="text-xl font-bold text-green-800">
                      ₦{(dashboardData?.totalAmountPaid ?? 0).toLocaleString()}
                    </p>
              </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
