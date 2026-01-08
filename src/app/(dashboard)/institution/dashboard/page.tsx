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
  Award,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  RefreshCcw,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function InstitutionDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Institution Dashboard</h1>
        <p className="text-muted-foreground">
          Hello {user?.firstName || "Institution User"}, manage onboarding,
          accreditations, staff, and training/medical operations from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Onboarding Status</p>
              <p className="text-3xl font-bold">In Progress</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Staff</p>
              <p className="text-3xl font-bold">18</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Accreditations</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Programs Running</p>
              <p className="text-3xl font-bold">6</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Checklist</CardTitle>
            <CardDescription>Finish onboarding to enable all services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Institution Profile", status: "Completed" },
              { label: "Primary Contact", status: "Completed" },
              { label: "Staff Upload", status: "Pending" },
              { label: "Training/Medical Details", status: "In Progress" },
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
              <Link href="/onboarding/institution">Continue Onboarding</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access the most common flows quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { title: "Update Institution Details", href: "/institutions", icon: Building2 },
              { title: "Manage Contacts & Staff", href: "/onboarding/institution", icon: Users },
              { title: "Apply for Accreditation", href: "/accreditations/apply", icon: FileText },
              { title: "View My Accreditations", href: "/accreditations", icon: Award },
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Accreditation Status</CardTitle>
              <CardDescription>Track ongoing and past accreditations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/accreditations/apply">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "QSS Certification", status: "Under Review", badge: "Submitted" },
              { title: "Medical Facility Approval", status: "Activated", badge: "Active" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                </div>
                <Badge variant="secondary">{item.badge}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Overview</CardTitle>
            <CardDescription>Recent additions and assignments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Dr. Jane Doe", role: "Medical Lead", status: "Active" },
              { name: "Capt. John Smith", role: "Training Director", status: "Active" },
              { name: "Mary Okafor", role: "Admin Officer", status: "Pending" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
                <Badge variant={item.status === "Active" ? "success" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

