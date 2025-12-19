"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, User, Shield } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const getPageTitle = (pathname: string, viewMode: "user" | "admin"): string => {
  // User view routes
  if (viewMode === "user") {
    const userRoutes: Record<string, string> = {
      "/": "Dashboard",
      "/training": "Training",
      "/training/enrollments": "My Enrollments",
      "/exams": "Examinations",
      "/exams/schedule": "Exam Schedule",
      "/exams/register": "Register for Exam",
      "/exams/history": "Exam History",
      "/exams/results": "Results",
      "/license-certification": "Certificates & License",
      "/profile-documents": "Profile & Documents",
    };

    if (pathname.startsWith("/training")) {
      return userRoutes[pathname] || "Training";
    }
    if (pathname.startsWith("/exams")) {
      return userRoutes[pathname] || "Examinations";
    }

    return userRoutes[pathname] || "Dashboard";
  }

  // Admin view routes
  const adminRoutes: Record<string, string> = {
    "/": "Dashboard",
    // User & Profile Management
    "/workspaces": "Workspace Management",
    "/users": "User Management",
    "/roles": "Role Management",
    "/permissions": "Permission Management",
    "/resources": "Resources Management",
    "/role-resources": "Role Resources Management",
    "/user-roles": "User Role Management",
    "/audit": "Audit Logs",
    "/settings": "Settings",
    // Certification & Registration
    "/certification/vessels": "Vessel Certification",
    "/certification/registration": "Registration Services",
    "/certification/documents": "Document Management",
    // Waste Management
    "/waste/tracking": "Waste Tracking",
    "/waste/disposal": "Disposal Method",
    "/waste/facilities": "Facilities",
    // Seafarer
    "/seafarer/overview": "Seafarer Overview",
    "/seafarer/applications": "Applications",
    "/seafarer/registry": "Seafarer Registry",
    "/seafarer/miis": "Accredited MIIs",
    // Incidents
    "/incidents/report": "Incident Report",
    "/incidents/assessment": "Risk Assessment",
    // Levies & Fees
    "/levies/fees": "Fee Management",
    "/levies/collection": "Levy Collection",
    // Invoices & Payments
    "/invoices/management": "Invoice Management",
    "/invoices/payments": "Payments",
    // Marine Environment
    "/marine/monitoring": "Environmental Monitoring",
    "/marine/pollution": "Pollution Control",
    "/marine/protected": "Protected Areas",
    // Cabotage
    "/cabotage/permits": "Cabotage Permits",
    "/cabotage/terminals": "Terminal Operations",
    // Surveillance
    "/surveillance/tracking": "Vessel Tracking",
    "/surveillance/monitoring": "Vessel Surveillance",
    // Compliance
    "/compliance/checks": "Compliance Checks",
  };

  // Check for dynamic routes
  if (pathname.startsWith("/workspaces/")) return "Workspace Details";
  if (pathname.startsWith("/users/")) return "User Details";

  return adminRoutes[pathname] || "Dashboard";
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { setMobileSidebarOpen, viewMode, toggleViewMode } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  const pageTitle = getPageTitle(pathname, viewMode);

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

      {/* View Toggle */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border">
        <User
          className={cn(
            "h-4 w-4",
            viewMode === "user" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <Switch
          checked={viewMode === "admin"}
          onCheckedChange={(checked) => {
            if (checked) {
              useUIStore.getState().setViewMode("admin");
            } else {
              useUIStore.getState().setViewMode("user");
            }
          }}
          id="view-toggle"
        />
        <Shield
          className={cn(
            "h-4 w-4",
            viewMode === "admin" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <Label
          htmlFor="view-toggle"
          className="text-xs font-medium cursor-pointer min-w-[40px]"
        >
          {viewMode === "user" ? "User" : "Admin"}
        </Label>
      </div>

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
