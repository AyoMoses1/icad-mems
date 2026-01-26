"use client";

import Link from "next/link";
import {
  Users,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Ship,
  UserPlus,
  FileText,
  AlertCircle,
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

export default function AgentDashboardPage() {
  const { user } = useAuthStore();

  // Check if onboarding is complete for Sea Farer workspace
  // Use workspace-specific onboarding status if available, otherwise fall back to top-level
  const isOnboardingComplete = isSeaFarerOnboardingComplete(user) ?? user?.is_onboarding_complete ?? false;

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

      {/* Key Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Active Seafarers
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Under management</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pending Applications
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Vessels</p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">In operation</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Ship className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Completed This Month
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <CheckCircle2 className="h-5 w-5" />
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

            <Link href="/seafarer/applications">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <FileCheck className="mr-3 h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium">Applications</p>
                  <p className="text-xs text-muted-foreground">
                    Manage applications
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/vessels">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-accent/50"
              >
                <Ship className="mr-3 h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Vessels</p>
                  <p className="text-xs text-muted-foreground">
                    Manage vessels
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
                  <p className="font-medium">Seafarer Registry</p>
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
          <Link href="/seafarer/applications">
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
              Your recent seafarer applications and updates will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

