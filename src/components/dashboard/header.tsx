"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useUIStore } from "@/store";

const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/": "Dashboard",
    "/seafarer/dashboard": "Seafarer Dashboard",
    "/institution/dashboard": "Institution Dashboard",
    // Training
    "/training": "Training",
    "/training/enrollments": "My Enrollments",
    "/training/enroll": "Enroll in Training",
    // License & Certification
    "/license-certification": "Certificates & License",
    // Profile & Documents
    "/profile-documents": "Profile & Documents",
    // Seafarer Management (Admin)
    "/seafarer/overview": "Seafarer Overview",
    "/seafarer/applications": "Applications",
    "/seafarer/applications/review": "Review Application",
    "/seafarer/registry": "Seafarer Registry",
    "/seafarer/profile": "Seafarer Profile",
    "/seafarer/add": "Add Seafarer",
    "/seafarer/miis": "Accredited MTIs",
    // Medical
    "/medical/services": "Medical Services",
    "/medical/appointments": "Medical Appointments",
    // Invoices & Payments
    "/invoices/management": "Invoice Management",
    "/invoices/payments": "Payments",
  };

  // Check for dynamic routes
  if (pathname.startsWith("/seafarer/applications/")) {
    if (pathname.includes("/review")) return "Review Application";
    return "Application Details";
  }
  if (pathname.startsWith("/seafarer/profile/")) return "Seafarer Profile";
  if (pathname.startsWith("/seafarer/miis/")) return "MTI Details";
  if (pathname.startsWith("/training/enroll")) return "Enroll in Training";

  return routes[pathname] || "Dashboard";
};

// Role display labels
const roleLabels: Record<string, string> = {
  SEAFAER: "Seafarer",
  TRAINING_INSTITUTION: "Training Institution",
  AGENT: "Agent",
  ACCREDITATION_OFFICER: "Accreditation Officer",
  INSPECTOR: "Inspector",
  FINANCE: "Finance",
  ADMIN: "Administrator",
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { setMobileSidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get role from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  const pageTitle = getPageTitle(pathname);
  const roleLabel = userRole ? roleLabels[userRole] || userRole : "";

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Companies, Vessels, Applications..."
            className="w-80 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Role Badge */}
      {roleLabel && (
        <Badge variant="outline" className="hidden md:flex items-center gap-1.5 px-2.5 py-1">
          <Shield className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{roleLabel}</span>
        </Badge>
      )}

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">New user registered</span>
            <span className="text-sm text-muted-foreground">
              John Doe created an account
            </span>
            <span className="text-xs text-muted-foreground">2 mins ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">Role updated</span>
            <span className="text-sm text-muted-foreground">
              Admin role permissions changed
            </span>
            <span className="text-xs text-muted-foreground">1 hour ago</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
            <span className="font-medium">Workspace created</span>
            <span className="text-sm text-muted-foreground">
              New workspace &quot;Fleet Management&quot; added
            </span>
            <span className="text-xs text-muted-foreground">3 hours ago</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-primary">
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Menu */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getInitials(user?.fullName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium">
          {user?.fullName || "John Doe"}
        </span>
      </div>
    </header>
  );
}
