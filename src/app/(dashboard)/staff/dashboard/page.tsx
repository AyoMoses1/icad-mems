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
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Hi {user?.firstName || "Staff"}, quickly review applications,
          accreditations, and institution updates.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Applications</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Accreditations Under Review</p>
              <p className="text-3xl font-bold">5</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Escalations</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Institutions Assigned</p>
              <p className="text-3xl font-bold">7</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
            <CardDescription>Prioritize applications and accreditations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Application Approvals", href: "/admin/applications/review", badge: "12" },
              { title: "Accreditations Under Review", href: "/admin/accreditations/review", badge: "5" },
              { title: "Audit Queue", href: "/admin/accreditations/audit", badge: "3" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <Badge variant="secondary">{item.badge}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest reviews and outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Application Approved",
                desc: "Deck Officer License",
                meta: "10 mins ago",
                icon: CheckCircle2,
              },
              {
                title: "Accreditation Audit Started",
                desc: "QSS Certification",
                meta: "2 hours ago",
                icon: FileText,
              },
              {
                title: "Institution Flagged",
                desc: "Missing documents",
                meta: "Yesterday",
                icon: Inbox,
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
      </div>
    </div>
  );
}

