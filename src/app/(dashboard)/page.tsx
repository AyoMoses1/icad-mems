"use client";

import { useEffect, useState } from "react";
import { Ship, FileCheck, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      action: "Certificate Issued",
      description: "STCW Basic Safety Training",
      timestamp: new Date().toISOString(),
      icon: FileCheck,
      iconBg: "bg-green-100 text-green-600",
    },
    {
      id: "2",
      action: "Exam Completed",
      description: "Navigation Officer Grade II",
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      icon: FileText,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      id: "3",
      action: "Application Submitted",
      description: "Deck Officer License",
      timestamp: new Date(Date.now() - 1209600000).toISOString(),
      icon: FileText,
      iconBg: "bg-purple-100 text-purple-600",
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "John"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your seafarer profile and status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Days at Sea</p>
                <p className="text-3xl font-bold">1,562</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Ship className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Active Certificate
                </p>
                <p className="text-3xl font-bold">4</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pending Applications
                </p>
                <p className="text-3xl font-bold">4</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold">75%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Personal Information</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Educational Background</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Update Sea Service Records</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/training"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium">
                  Find Training Course
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/license-certification"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium">Apply for License</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="/training/enrollments"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium">My Enrolment</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Certificate Issued</p>
                  <p className="text-sm text-muted-foreground">
                    STCW Basic Safety Training
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 days ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Exam Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Navigation Officer Grade II
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 week ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    Deck Officer License
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 weeks ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">STCW Refresher Course</p>
                  <p className="text-sm text-muted-foreground">
                    Training • Dec 20, 2024
                  </p>
                </div>
                <Badge variant="info">Enrolled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Navigation Written Exam</p>
                  <p className="text-sm text-muted-foreground">
                    Examination • Jan 5, 2025
                  </p>
                </div>
                <Badge variant="info">Enrolled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Medical Certificate</p>
                  <p className="text-sm text-muted-foreground">
                    Renewal • Feb 15, 2025
                  </p>
                </div>
                <Badge variant="warning">Expiring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
