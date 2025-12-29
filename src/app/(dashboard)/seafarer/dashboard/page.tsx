"use client";

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
  MapPin,
  Ship,
} from "lucide-react";
import Link from "next/link";

export default function SeafarerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seafarer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || "Seafarer"}. Track your training,
          licenses, and onboarding progress at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Certificates</p>
              <p className="text-3xl font-bold">4</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Applications</p>
              <p className="text-3xl font-bold">3</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Training Enrolled</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sea Service (days)</p>
              <p className="text-3xl font-bold">1,562</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 text-slate-600">
              <Ship className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Progress</CardTitle>
            <CardDescription>Complete these steps to unlock services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Personal Information", status: "Completed" },
              { label: "Identity Documents", status: "Pending" },
              { label: "Sea Service Records", status: "In Progress" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="secondary">{item.status}</Badge>
              </div>
            ))}
            <Button className="w-full" asChild>
              <Link href="/onboarding/seafarer">
                Continue Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                title: "Apply for Accreditation",
                href: "/accreditations/apply",
                icon: FileText,
              },
              { title: "View Applications", href: "/seafarer/applications", icon: ClipboardList },
              { title: "Enroll in Training", href: "/training", icon: GraduationCap },
              { title: "Update Profile & Documents", href: "/profile-documents", icon: LifeBuoy },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Certificate Issued",
                desc: "STCW Basic Safety Training",
                meta: "2 days ago",
                icon: FileCheck2,
              },
              {
                title: "Application Submitted",
                desc: "Deck Officer License",
                meta: "1 week ago",
                icon: FileText,
              },
              {
                title: "Training Enrolled",
                desc: "Navigation Refresher",
                meta: "2 weeks ago",
                icon: GraduationCap,
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.meta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "STCW Refresher Course",
                meta: "Training • Jan 8, 2026",
                badge: "Enrolled",
              },
              {
                title: "Medical Certificate Renewal",
                meta: "Medical • Feb 2, 2026",
                badge: "Required",
              },
              {
                title: "Sea Service Log Update",
                meta: "Service • Mar 10, 2026",
                badge: "Pending",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.meta}</p>
                </div>
                <Badge variant="secondary">{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

