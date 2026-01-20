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
  ClipboardCheck,
  AlertTriangle,
  UserPlus,
  Receipt,
  FileCheck,
  FolderOpen,
  Search,
  Calendar,
  BarChart3,
  ArrowLeft,
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

// ============================================================================
// Role-based Menu Definitions
// Based on COMPLETE_API_INTEGRATION_GUIDE.md modules
// ============================================================================

/**
 * SEAFARER Menu Items
 * Seafarers are users who can:
 * - View their dashboard
 * - Manage their profile
 * - Apply for certificates/services
 * - View their applications and payments
 * - Access training
 */
const seafarerMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/seafarer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "#",
    icon: User,
    children: [
      { title: "Profile & Documents", href: "/profile-documents" },
      { title: "Education Details", href: "/seafarer/profile/education" },
      { title: "Contact Details", href: "/seafarer/profile/contact" },
    ],
  },
  {
    title: "Services",
    href: "/seafarer/services",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "#",
    icon: FileText,
    children: [
      { title: "My Applications", href: "/seafarer/applications" },
      { title: "Application History", href: "/seafarer/applications/history" },
    ],
  },
  {
    title: "Billing & Payments",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "My Invoices", href: "/invoices/my-invoices" },
      { title: "Payment History", href: "/invoices/payments" },
    ],
  },
  {
    title: "Training",
    href: "#",
    icon: GraduationCap,
    children: [
      { title: "Available Courses", href: "/training/courses" },
      { title: "My Enrollments", href: "/training/enrollments" },
    ],
  },
];

/**
 * TRAINING_INSTITUTION Menu Items
 * Training institutions can:
 * - Manage their institution profile
 * - Manage courses/programs
 * - Apply for accreditation
 * - Respond to deficiencies
 * - View inspection results
 */
const trainingInstitutionMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/institution/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Institution Management",
    href: "#",
    icon: Building2,
    children: [
      { title: "My Institution", href: "/institutions" },
      { title: "Documents", href: "/documents" },
    ],
  },
  {
    title: "Training Programs",
    href: "#",
    icon: GraduationCap,
    children: [
      { title: "Courses", href: "/training/courses" },
      { title: "Programs", href: "/training/programs" },
      { title: "Cohorts", href: "/training/cohorts" },
      { title: "Enrollments", href: "/training/enrollments" },
    ],
  },
  {
    title: "Accreditation",
    href: "#",
    icon: Award,
    children: [
      { title: "Apply for Accreditation", href: "/accreditations/apply" },
      { title: "My Accreditations", href: "/accreditations" },
      { title: "STCW Standards", href: "/accreditations/stcw" },
    ],
  },
  {
    title: "Inspections & Deficiencies",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Scheduled Inspections", href: "/institution/inspections" },
      { title: "Deficiency Reports", href: "/institution/deficiencies" },
    ],
  },
];

/**
 * AGENT Menu Items
 * Agents are similar to training institutions
 */
const agentMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/institution/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agency Management",
    href: "#",
    icon: Building2,
    children: [
      { title: "My Agency", href: "/institutions" },
      { title: "Documents", href: "/documents" },
    ],
  },
  {
    title: "Accreditation",
    href: "#",
    icon: Award,
    children: [
      { title: "Apply for Accreditation", href: "/accreditations/apply" },
      { title: "My Accreditations", href: "/accreditations" },
    ],
  },
  {
    title: "Inspections & Deficiencies",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Scheduled Inspections", href: "/institution/inspections" },
      { title: "Deficiency Reports", href: "/institution/deficiencies" },
    ],
  },
];

/**
 * ACCREDITATION_OFFICER Menu Items
 * Officers can:
 * - Review accreditation requests
 * - Manage institutions
 * - Schedule inspections
 * - Create and resolve deficiencies
 * - Schedule follow-up audits
 */
const accreditationOfficerMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Accreditations",
    href: "#",
    icon: Award,
    children: [
      { title: "Pending Reviews", href: "/admin/accreditations/review" },
      { title: "All Accreditations", href: "/admin/accreditations" },
      { title: "STCW Standards", href: "/accreditations/stcw" },
    ],
  },
  {
    title: "Institutions",
    href: "#",
    icon: Building2,
    children: [
      { title: "All Institutions", href: "/institutions" },
      { title: "Institution Documents", href: "/documents" },
    ],
  },
  {
    title: "Inspections",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Schedule Inspection", href: "/admin/inspections" },
      { title: "Inspection Reports", href: "/admin/inspections/reports" },
    ],
  },
  {
    title: "Deficiencies",
    href: "#",
    icon: AlertTriangle,
    children: [
      { title: "Deficiency Reports", href: "/admin/inspections/deficiencies" },
    ],
  },
  {
    title: "Audits",
    href: "#",
    icon: ClipboardList,
    children: [
      { title: "Follow-up Audits", href: "/admin/audits" },
    ],
  },
];

/**
 * INSPECTOR Menu Items
 * Inspectors can:
 * - View assigned inspections
 * - Create and submit inspection reports
 * - View deficiency reports
 * - Update audit information
 */
const inspectorMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "My Inspections",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Assigned Inspections", href: "/admin/inspections" },
      { title: "My Reports", href: "/admin/inspections/reports" },
    ],
  },
  {
    title: "Deficiency Reports",
    href: "/admin/inspections/deficiencies",
    icon: AlertTriangle,
  },
  {
    title: "Audits",
    href: "/admin/audits",
    icon: ClipboardList,
  },
  {
    title: "Institutions",
    href: "/institutions",
    icon: Building2,
  },
];

/**
 * FINANCE Menu Items
 * Finance users can:
 * - Manage invoices
 * - View payments
 * - Access financial reports
 */
const financeMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Invoice Management",
    href: "#",
    icon: Receipt,
    children: [
      { title: "All Invoices", href: "/invoices/management" },
      { title: "Pending Invoices", href: "/invoices/pending" },
    ],
  },
  {
    title: "Payments",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "Payment History", href: "/invoices/payments" },
      { title: "Payment Verification", href: "/invoices/verify" },
    ],
  },
  {
    title: "Applications",
    href: "#",
    icon: FileText,
    children: [
      { title: "All Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
  },
];

/**
 * ADMIN Menu Items
 * Admins have full access to all features:
 * - Onboarding management
 * - Seafarer management
 * - Institution management
 * - Application review
 * - Accreditation management
 * - Inspection & Audit management
 * - Financial management
 * - System configuration
 */
const adminMenuItems: MenuItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Onboarding",
    href: "#",
    icon: UserPlus,
    children: [
      { title: "Pending Requests", href: "/admin/onboarding" },
      { title: "All Onboardings", href: "/admin/onboarding?status=all" },
    ],
  },
  {
    title: "Seafarer Management",
    href: "#",
    icon: User,
    children: [
      { title: "Add Seafarer", href: "/seafarer/add" },
      { title: "Seafarer Registry", href: "/seafarer/registry" },
      { title: "Seafarer Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Institutions",
    href: "#",
    icon: Building2,
    children: [
      { title: "All Institutions", href: "/institutions" },
      { title: "Training Institutions", href: "/institutions?type=training" },
      { title: "Medical Institutes", href: "/medical-institutes" },
    ],
  },
  {
    title: "Applications Review",
    href: "#",
    icon: FileCheck,
    children: [
      { title: "Pending Applications", href: "/admin/applications/review" },
      { title: "All Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Accreditations",
    href: "#",
    icon: Award,
    children: [
      { title: "Accreditations Dashboard", href: "/admin/accreditations" },
      { title: "Review Accreditations", href: "/admin/accreditations/review" },
      { title: "STCW Standards", href: "/accreditations/stcw" },
    ],
  },
  {
    title: "Inspections & Audits",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Inspection Schedules", href: "/admin/inspections" },
      { title: "Inspection Reports", href: "/admin/inspections/reports" },
      { title: "Deficiency Reports", href: "/admin/inspections/deficiencies" },
      { title: "Follow-up Audits", href: "/admin/audits" },
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
  {
    title: "System Management",
    href: "#",
    icon: Settings,
    children: [
      { title: "Certificates", href: "/certificates" },
      { title: "Documents Master", href: "/documents" },
      { title: "Ranks", href: "/ranks" },
      { title: "Nationalities", href: "/nationalities" },
      { title: "Onboarding Requirements", href: "/onboarding-requirements" },
    ],
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
  },
];

// ============================================================================
// Role-based Menu Mapping
// Maps backend roles from IMS userInfo to menu items
// ============================================================================

const getMenuItemsByRole = (role: string | null): MenuItem[] => {
  if (!role) {
    return []; // No menu items if no role
  }

  const normalizedRole = role.toUpperCase().replace(/\s+/g, "_");

  switch (normalizedRole) {
    case "SEAFARER":
    case "SEA_FARER":
      return seafarerMenuItems;
    
    case "TRAINING_INSTITUTION":
    case "TRAINING":
    case "MTI":
      return trainingInstitutionMenuItems;
    
    case "AGENT":
      return agentMenuItems;
    
    case "ACCREDITATION_OFFICER":
    case "OFFICER":
      return accreditationOfficerMenuItems;
    
    case "INSPECTOR":
      return inspectorMenuItems;
    
    case "FINANCE":
    case "ACCOUNTANT":
      return financeMenuItems;
    
    case "ADMIN":
    case "ADMINISTRATOR":
    case "SUPER_ADMIN":
    case "SUPERADMIN":
      return adminMenuItems;
    
    default:
      // Default to seafarer for unknown roles in seafarer app
      console.warn(`Unknown role: ${role}, defaulting to seafarer menu`);
      return seafarerMenuItems;
  }
};

// Legacy function for backward compatibility with UI store userType
const getMenuItems = (userType: UserType): MenuItem[] => {
  // Try to get role from localStorage first
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole");
    if (role) {
      return getMenuItemsByRole(role);
    }
  }
  
  // Fallback to userType
  switch (userType) {
    case "admin":
      return adminMenuItems;
    case "seafarer":
      return seafarerMenuItems;
    case "institution":
      return trainingInstitutionMenuItems;
    default:
      return adminMenuItems;
  }
};

// ============================================================================
// Sidebar Component
// ============================================================================

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Get role from localStorage (set by loading page)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  // Get menu items based on role
  const currentMenuItems = userRole 
    ? getMenuItemsByRole(userRole)
    : getMenuItems("admin"); // Fallback

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
      // Clear role from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("userRole");
      }
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
  }, [pathname, userRole]); // eslint-disable-line react-hooks/exhaustive-deps

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
            {userRole ? userRole.replace(/_/g, " ") : "Workspace"}
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

      {/* Return to IMS Link */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm hover:bg-sidebar-muted text-sidebar-foreground"
          onClick={() => {
            window.location.href = "http://localhost:3000";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to IMS</span>
        </Button>
      </div>

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
