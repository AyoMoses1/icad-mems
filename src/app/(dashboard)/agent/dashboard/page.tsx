"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  FileText,
  AlertCircle,
  Ship,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { isSeaFarerOnboardingComplete } from "@/lib/utils/workspace-helpers";
import { getAllOnboardings } from "@/lib/services/onboarding-service";
import {
  getSeafarerEmployments,
} from "@/lib/services/seafarer-employment-training-service";

interface EmployerDashboardStats {
  activeSeafarersCount: number;
  totalContractsCount: number;
  pendingAcceptanceCount: number;
  signedContractsCount: number;
}

export default function AgentDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<EmployerDashboardStats>({
    activeSeafarersCount: 0,
    totalContractsCount: 0,
    pendingAcceptanceCount: 0,
    signedContractsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if onboarding is complete for Sea Farer workspace
  const isOnboardingComplete = isSeaFarerOnboardingComplete(user) ?? user?.is_onboarding_complete ?? false;

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Active seafarers = total count of employer's seafarers (from onboarding/registry list)
      const onboardingsRes = await getAllOnboardings();
      const onboardingsOk = onboardingsRes.success ?? (onboardingsRes as { successful?: boolean }).successful;
      let activeSeafarersCount = 0;
      if (onboardingsOk && onboardingsRes.data && Array.isArray(onboardingsRes.data)) {
        const seafarerOnly = onboardingsRes.data.filter(
          (o) => (o.role?.toUpperCase?.() ?? "") === "SEAFARER"
        );
        activeSeafarersCount = seafarerOnly.length;
      }

      // Contracts: total, pending acceptance, signed (from seafarer-employment API)
      let totalContractsCount = 0;
      let pendingAcceptanceCount = 0;
      let signedContractsCount = 0;

      const [totalRes, pendingRes, signedRes] = await Promise.all([
        getSeafarerEmployments({ pageNumber: 1, pageSize: 1 }),
        getSeafarerEmployments({ acceptanceStatus: "Pending", pageNumber: 1, pageSize: 1 }),
        getSeafarerEmployments({ contractStatus: "Signed", pageNumber: 1, pageSize: 1 }),
      ]);

      totalContractsCount = totalRes.totalCount ?? 0;
      pendingAcceptanceCount = pendingRes.totalCount ?? 0;
      signedContractsCount = signedRes.totalCount ?? 0;

      setStats({
        activeSeafarersCount,
        totalContractsCount,
        pendingAcceptanceCount,
        signedContractsCount,
      });
    } catch (error) {
      console.error("Error loading employer dashboard data:", error);
      setStats({
        activeSeafarersCount: 0,
        totalContractsCount: 0,
        pendingAcceptanceCount: 0,
        signedContractsCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOnboardingComplete) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isOnboardingComplete, loadDashboardData]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "Agent"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your agent dashboard
        </p>
      </div>

      {/* Onboarding Alert - Show only if not complete */}
      {!isOnboardingComplete && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Complete Your Onboarding
            </CardTitle>
            <CardDescription>
              You need to complete your onboarding to access all agent services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                Please complete your agent profile information, contact details,
                and upload required documents to get started with managing
                seafarers and applications.
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

      {/* Key Stats Cards - employer-relevant metrics from seafarers & contracts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/seafarer/registry">
          <Card className="border-l-4 border-l-blue-500 hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Active Seafarers
                  </p>
                  <p className="text-3xl font-bold">
                    {isLoading ? "—" : stats.activeSeafarersCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Under management</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employer/contracts">
          <Card className="border-l-4 border-l-slate-600 hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Contracts Assigned
                  </p>
                  <p className="text-3xl font-bold">
                    {isLoading ? "—" : stats.totalContractsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Total employments</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
                  <Ship className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employer/contracts?acceptance=Pending">
          <Card className="border-l-4 border-l-orange-500 hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pending Acceptance
                  </p>
                  <p className="text-3xl font-bold">
                    {isLoading ? "—" : stats.pendingAcceptanceCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Awaiting seafarer</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                  <Send className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employer/contracts?status=Signed">
          <Card className="border-l-4 border-l-purple-500 hover:bg-muted/50 transition-colors h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Contracts Signed
                  </p>
                  <p className="text-3xl font-bold">
                    {isLoading ? "—" : stats.signedContractsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Ready for assignment</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/seafarer/add">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <UserPlus className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Onboard Seafarer</p>
                  <p className="text-xs text-muted-foreground">
                    Register new seafarer
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/employer/employ">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Ship className="mr-3 h-5 w-5 text-slate-600" />
                <div className="text-left">
                  <p className="font-medium">Employ Seafarer</p>
                  <p className="text-xs text-muted-foreground">
                    Create contract offer
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/employer/contracts">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <FileCheck className="mr-3 h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Assign to Ship / Contracts</p>
                  <p className="text-xs text-muted-foreground">
                    Manage contracts & ship assignments
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
                <Users className="mr-3 h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">My Seafarers</p>
                  <p className="text-xs text-muted-foreground">
                    View all seafarers
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/employer/contracts">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">
              Your contracts and ship assignments will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

