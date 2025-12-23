"use client";

import React, { Fragment, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  FileText,
  Users,
  Settings,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Briefcase,
  BookOpen,
  Stethoscope,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useUIStore } from "@/store";
import type { UserType } from "@/store/ui-store";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ title: string; href: string }>;
};

// Seafarer Menu Items
const seafarerMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Training", href: "/training", icon: GraduationCap },
  {
    title: "License & Certification",
    href: "/license-certification",
    icon: Award,
  },
  { title: "Profile & Documents", href: "/profile-documents", icon: User },
  { title: "My Applications", href: "/seafarer/applications", icon: FileText },
  { title: "Onboarding", href: "/onboarding/seafarer", icon: User },
];

// Admin Menu Items
const adminMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Seafarer Management",
    href: "#",
    icon: User,
    children: [
      { title: "Overview", href: "/seafarer/overview" },
      { title: "Applications", href: "/seafarer/applications" },
      { title: "Seafarer Registry", href: "/seafarer/registry" },
      { title: "Add Seafarer", href: "/seafarer/add" },
    ],
  },
  {
    title: "Institutions",
    href: "#",
    icon: Building2,
    children: [
      { title: "All Institutions", href: "/institutions" },
      { title: "Accredited MTIs", href: "/seafarer/miis" },
    ],
  },
  {
    title: "Applications Review",
    href: "#",
    icon: ClipboardList,
    children: [
      { title: "Pending Applications", href: "/admin/applications/review" },
      { title: "All Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Accreditations",
    href: "#",
    icon: CheckCircle,
    children: [
      { title: "Under Review", href: "/admin/accreditations/review" },
      { title: "All Accreditations", href: "/accreditations" },
    ],
  },
  {
    title: "Financial",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "Invoice Management", href: "/invoices/management" },
      { title: "Payments", href: "/invoices/payments" },
    ],
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

// Institution Menu Items
const institutionMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Institution Management",
    href: "#",
    icon: Building2,
    children: [
      { title: "My Institution", href: "/institutions" },
      { title: "Onboarding", href: "/onboarding/institution" },
      { title: "Contacts", href: "/institutions/contacts" },
      { title: "Staff", href: "/institutions/staff" },
    ],
  },
  {
    title: "Training Institute",
    href: "#",
    icon: GraduationCap,
    children: [
      { title: "Programs", href: "/training/programs" },
      { title: "Courses", href: "/training/courses" },
      { title: "Enrollments", href: "/training/enrollments" },
    ],
  },
  {
    title: "Medical Institute",
    href: "#",
    icon: Stethoscope,
    children: [
      { title: "Services", href: "/medical/services" },
      { title: "Appointments", href: "/medical/appointments" },
    ],
  },
  {
    title: "Accreditation",
    href: "#",
    icon: Award,
    children: [
      { title: "Apply for Accreditation", href: "/accreditations/apply" },
      { title: "My Accreditations", href: "/accreditations" },
      { title: "Status Check", href: "/accreditations/status" },
    ],
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

// Staff Menu Items
const staffMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Applications",
    href: "#",
    icon: ClipboardList,
    children: [
      { title: "Pending Review", href: "/admin/applications/review" },
      { title: "All Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Accreditations",
    href: "#",
    icon: CheckCircle,
    children: [
      { title: "Under Review", href: "/admin/accreditations/review" },
      { title: "Audit", href: "/admin/accreditations/audit" },
    ],
  },
  {
    title: "Institutions",
    href: "#",
    icon: Building2,
    children: [
      { title: "All Institutions", href: "/institutions" },
      { title: "Accredited MTIs", href: "/seafarer/miis" },
    ],
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

// Get menu items based on user type
const getMenuItems = (userType: UserType): MenuItem[] => {
  switch (userType) {
    case "admin":
      return adminMenuItems;
    case "seafarer":
      return seafarerMenuItems;
    case "institution":
      return institutionMenuItems;
    case "staff":
      return staffMenuItems;
    default:
      return adminMenuItems;
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mobileSidebarOpen, setMobileSidebarOpen, viewMode, userType } =
    useUIStore();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const currentMenuItems = getMenuItems(userType);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleLogout = async () => {
    try {
      const { apiPostAuth } = await import("@/lib/api-client");
      await apiPostAuth("/connect/logout", {});
    } catch (error) {
      console.error("Logout - API call failed:", error);
    } finally {
      logout();
      router.push("/auth/signin");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  const isChildActive = (children?: { title: string; href: string }[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href));
  };

  // Auto-expand parent if any child is active
  useEffect(() => {
    currentMenuItems.forEach((item) => {
      if (item.children && isChildActive(item.children)) {
        setExpandedItems((prev) => {
          if (!prev.includes(item.title)) {
            return [...prev, item.title];
          }
          return prev;
        });
      }
    });
  }, [pathname, userType]); // eslint-disable-line react-hooks/exhaustive-deps

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLink = ({
    item,
    isChild = false,
    icon,
  }: {
    item: { title: string; href: string };
    isChild?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }) => {
    const active = isActive(item.href);
    const Icon = icon;

    if (isChild) {
      return (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ml-6 relative border",
            "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-sidebar-muted-foreground/30",
            "before:content-['']",
            active
              ? "bg-[#1E40AF] border-[#3B82F6] text-white font-medium"
              : "text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted border-transparent",
          )}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <span className="absolute left-0 top-1/2 w-3 h-px bg-sidebar-muted-foreground/30" />
          {item.title}
        </Link>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
          active
            ? "bg-[#1E40AF] border border-[#3B82F6] text-white font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-muted",
        )}
        onClick={() => setMobileSidebarOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        <span>{item.title}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="block">
          <div className="w-full rounded-lg bg-white flex items-center justify-center overflow-hidden p-3">
            <Image
              src="/logo.png"
              alt="NIMASA Logo"
              width={240}
              height={80}
              className="object-contain w-full h-auto"
            />
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4 sidebar-scroll">
        <div className="px-3 mb-3">
          <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
            Workspace
          </span>
        </div>

        <nav className="space-y-1">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.title);
            const isItemActive =
              isActive(item.href) || isChildActive(item.children);

            if (hasChildren) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-colors border",
                      isItemActive
                        ? "bg-[#1E40AF] border-[#3B82F6] text-white font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-muted border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1 ml-0">
                      {item.children?.map((child) => (
                        <NavLink key={child.href} item={child} isChild />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return <NavLink key={item.href} item={item} icon={Icon} />;
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-6 h-auto hover:bg-sidebar-muted text-sidebar-foreground"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">
                  {user?.fullName || "User"}
                </span>
                <span className="text-xs text-sidebar-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
