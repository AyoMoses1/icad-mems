"use client";

import React, { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useUIStore, useWorkspaceStore } from "@/store";
import type { UserType } from "@/store/ui-store";
import {
  getMenu,
  filterMenuByPermissions,
  type WorkspaceMenuDto,
  type MenuItemDto,
} from "@/lib/services/menu-service";
import { getMyPermissions } from "@/lib/services/permissions-service";
import {
  isSeaFarerOnboardingComplete,
  getSeaFarerWorkspace,
  isSuperAdminInSeafarer,
} from "@/lib/utils/workspace-helpers";
import { Skeleton } from "@/components/ui/skeleton";

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
      { title: "Voyage Activities", href: "/seafarer/profile/voyages" },
      { title: "Training Records", href: "/seafarer/profile/trainings" },
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
    title: "Audit Logs",
    href: "/seafarer/audit-logs",
    icon: FileText,
  },
];

/**
 * TRAINING_INSTITUTION Menu Items
 * Training institutions can:
 * - Manage their institution profile
 * - Onboard seafarers (on behalf of)
 * - View seafarer registry (read-only, cannot approve)
 * - Apply for services on behalf of seafarers
 * - Upload training results for seafarers (Excel format)
 * - Apply for accreditation
 * - Respond to deficiencies
 * - View inspection results
 *
 * NOTE: Training institutions have ALL agent capabilities PLUS:
 * - Upload Training Results feature
 */
const trainingInstitutionMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/institution/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Seafarer Management",
    href: "#",
    icon: Users,
    children: [
      { title: "Onboard Seafarer", href: "/seafarer/add" },
      { title: "Seafarer Registry", href: "/seafarer/registry" },
    ],
  },
  {
    title: "Services & Applications",
    href: "#",
    icon: Briefcase,
    children: [
      { title: "Apply for Seafarer", href: "/seafarer/services" },
      { title: "View Applications", href: "/seafarer/applications" },
    ],
  },
  {
    title: "Training Results",
    href: "#",
    icon: GraduationCap,
    children: [
      { title: "Upload Results", href: "/institution/training-results/upload" },
      { title: "View Results", href: "/institution/training-results" },
    ],
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
  {
    title: "Billing & Payments",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "My Invoices", href: "/invoices/my-invoices" },
      { title: "Payment History", href: "/invoices/payments" },
    ],
  },
];

/**
 * AGENT Menu Items
 * Agents can:
 * - Onboard seafarers (on behalf of)
 * - View seafarer registry (read-only, cannot approve)
 * - Apply for services on behalf of seafarers
 * - Manage their agency profile
 * - Apply for accreditation
 * - Respond to deficiencies
 * - View inspection results
 *
 * NOTE: Agents have the SAME capabilities as training institutions
 * EXCEPT they cannot upload training results
 */
const agentMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/agent/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Seafarer Management",
    href: "#",
    icon: Users,
    children: [
      { title: "Onboard Seafarer", href: "/seafarer/add" },
      { title: "Seafarer Registry", href: "/seafarer/registry" },
    ],
  },
  {
    title: "Services & Applications",
    href: "#",
    icon: Briefcase,
    children: [
      { title: "Apply for Seafarer", href: "/seafarer/services" },
      { title: "View Applications", href: "/seafarer/applications" },
    ],
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
  {
    title: "Billing & Payments",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "My Invoices", href: "/invoices/my-invoices" },
      { title: "Payment History", href: "/invoices/payments" },
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
    children: [{ title: "Follow-up Audits", href: "/admin/audits" }],
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
    children: [{ title: "All Applications", href: "/seafarer/applications" }],
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
  },
];

/**
 * OWNER Menu Items
 * Owners are owners of just one tenant and can:
 * - View and access the three onboarding types (Seafarer, Agent, Training Institution)
 * - Access all sections that seafarer, agent, and training institution can access
 * - Complete onboarding for any of these roles
 * - They do NOT have admin access (different from admin menu)
 */
const ownerMenuItems: MenuItem[] = [
  // Dashboard - points to role selection screen
  { title: "Dashboard", href: "/", icon: LayoutDashboard },

  // Seafarer Management (Agent/Training Institution capability)
  {
    title: "Seafarer Management",
    href: "#",
    icon: Users,
    children: [
      { title: "Onboard Seafarer", href: "/seafarer/add" },
      { title: "Seafarer Registry", href: "/seafarer/registry" },
    ],
  },

  // My Profile (Seafarer capability)
  {
    title: "My Profile",
    href: "#",
    icon: User,
    children: [
      { title: "Profile & Documents", href: "/profile-documents" },
      { title: "Education Details", href: "/seafarer/profile/education" },
      { title: "Contact Details", href: "/seafarer/profile/contact" },
      { title: "Voyage Activities", href: "/seafarer/profile/voyages" },
      { title: "Training Records", href: "/seafarer/profile/trainings" },
    ],
  },

  // Services & Applications
  {
    title: "Services & Applications",
    href: "#",
    icon: Briefcase,
    children: [
      { title: "Browse Services", href: "/seafarer/services" },
      { title: "My Applications", href: "/seafarer/applications" },
      { title: "Application History", href: "/seafarer/applications/history" },
    ],
  },

  // Training Results (Training Institution capability)
  {
    title: "Training Results",
    href: "#",
    icon: GraduationCap,
    children: [
      { title: "Upload Results", href: "/institution/training-results/upload" },
      { title: "View Results", href: "/institution/training-results" },
    ],
  },

  // Institution/Agency Management
  {
    title: "Institution Management",
    href: "#",
    icon: Building2,
    children: [
      { title: "My Institution", href: "/institutions" },
      { title: "Documents", href: "/documents" },
    ],
  },

  // Accreditation
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

  // Inspections & Deficiencies
  {
    title: "Inspections & Deficiencies",
    href: "#",
    icon: ClipboardCheck,
    children: [
      { title: "Scheduled Inspections", href: "/institution/inspections" },
      { title: "Deficiency Reports", href: "/institution/deficiencies" },
    ],
  },

  // Billing & Payments
  {
    title: "Billing & Payments",
    href: "#",
    icon: CreditCard,
    children: [
      { title: "My Invoices", href: "/invoices/my-invoices" },
      { title: "Payment History", href: "/invoices/payments" },
    ],
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
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "Seafarer",
    href: "#",
    icon: UserPlus,
    children: [{ title: "All Onboarding", href: "/admin/onboarding" }],
  },
  {
    title: "Seafarer Management",
    href: "#",
    icon: User,
    children: [
      { title: "Onboard Seafarer", href: "/seafarer/add" },
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
      { title: "Services", href: "/admin/services" },
      { title: "Requirement Lists", href: "/admin/requirement-lists" },
      { title: "Certificates", href: "/certificates" },
      { title: "Documents Master", href: "/documents" },
      { title: "Ranks", href: "/ranks" },
      { title: "Nationalities", href: "/nationalities" },
      { title: "Onboarding Requirements", href: "/onboarding-requirements" },
      { title: "Audit Logs", href: "/admin/audit-logs" },
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
    case "OWNER":
      return ownerMenuItems;

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
// Icon Mapping for API Menu Items
// Maps menu item names/URLs to appropriate icons
// ============================================================================

const getIconForMenuItem = (
  name: string,
  url?: string | null
): React.ComponentType<{ className?: string }> => {
  const nameLower = name.toLowerCase();
  const urlLower = url?.toLowerCase() || "";

  // Dashboard
  if (nameLower.includes("dashboard") || urlLower.includes("dashboard")) {
    return LayoutDashboard;
  }

  // Profile/User
  if (
    nameLower.includes("profile") ||
    nameLower.includes("user") ||
    nameLower.includes("account")
  ) {
    return User;
  }

  // Services
  if (nameLower.includes("service")) {
    return Briefcase;
  }

  // Applications
  if (nameLower.includes("application")) {
    return FileText;
  }

  // Billing/Payments/Invoices
  if (
    nameLower.includes("billing") ||
    nameLower.includes("payment") ||
    nameLower.includes("invoice")
  ) {
    return CreditCard;
  }

  // Institution/Agency
  if (
    nameLower.includes("institution") ||
    nameLower.includes("agency") ||
    nameLower.includes("organization")
  ) {
    return Building2;
  }

  // Accreditation
  if (nameLower.includes("accreditation")) {
    return Award;
  }

  // Inspection
  if (nameLower.includes("inspection")) {
    return ClipboardCheck;
  }

  // Deficiency
  if (nameLower.includes("deficiency")) {
    return AlertTriangle;
  }

  // Audit
  if (nameLower.includes("audit")) {
    return ClipboardList;
  }

  // Onboarding
  if (nameLower.includes("onboarding")) {
    return UserPlus;
  }

  // Seafarer Management
  if (nameLower.includes("seafarer")) {
    return User;
  }

  // Financial/Finance
  if (nameLower.includes("financial") || nameLower.includes("finance")) {
    return Receipt;
  }

  // Statistics/Reports
  if (nameLower.includes("statistic") || nameLower.includes("report")) {
    return BarChart3;
  }

  // Settings/System
  if (
    nameLower.includes("setting") ||
    nameLower.includes("system") ||
    nameLower.includes("configuration")
  ) {
    return Settings;
  }

  // Documents
  if (nameLower.includes("document")) {
    return FileText;
  }

  // Education/Training
  if (
    nameLower.includes("education") ||
    nameLower.includes("training") ||
    nameLower.includes("course")
  ) {
    return GraduationCap;
  }

  // Default icon
  return FileText;
};

// ============================================================================
// Convert API Menu Items to Sidebar Menu Format
// ============================================================================

/** Remove "Admin " prefix from menu labels for display (e.g. "Admin Dashboard" → "Dashboard") */
function normalizeMenuItemTitle(name: string): string {
  if (!name || typeof name !== "string") return name;
  const trimmed = name.trim();
  if (/^Admin\s+/i.test(trimmed)) return trimmed.replace(/^Admin\s+/i, "").trim();
  return trimmed;
}

const convertApiMenuToSidebarMenu = (
  workspaceMenus: WorkspaceMenuDto[]
): MenuItem[] => {
  const menuItems: MenuItem[] = [];

  // For now, we'll use the first workspace's menu items
  // In the future, you might want to show workspace switcher or merge menus
  if (workspaceMenus.length === 0) {
    return menuItems;
  }

  // Get all root-level items from all workspaces
  const allRootItems: MenuItemDto[] = [];
  workspaceMenus.forEach((workspaceMenu) => {
    allRootItems.push(...workspaceMenu.resources);
  });

  // Convert API menu items to sidebar menu items (with normalized display titles)
  const convertMenuItem = (item: MenuItemDto): MenuItem => {
    const children =
      item.children && item.children.length > 0
        ? item.children.map((child) => ({
            title: normalizeMenuItemTitle(child.name),
            href: child.url || "#",
          }))
        : undefined;

    return {
      title: normalizeMenuItemTitle(item.name),
      href: item.url || "#",
      icon: getIconForMenuItem(item.name, item.url),
      children: children,
    };
  };

  return allRootItems.map(convertMenuItem);
};

/** Admin Dashboard - first menu item for Super Admin */
const ADMIN_DASHBOARD_HREF = "/admin/dashboard";

/**
 * URLs or path prefixes for menu items that are for agent/seafarer use only.
 * Super Admin should not see these; only administrative menus are shown.
 */
const SUPER_ADMIN_EXCLUDED_HREFS: string[] = [
  "/agent/dashboard",
  "/agent/",
  "/seafarer/dashboard",
  "/seafarer/applications/history",
  "/seafarer/overview",
  "/seafarer/profile",
  "/seafarer/registry",
  "/seafarer/services",
  "/invoices/my-invoices",
  "/profile-documents",
  "/onboarding/seafarer", // Onboarding Seafarer (form) - seafarer-facing
  "/accreditations/apply", // Apply Accreditation - user-facing
  "/license-certification/apply", // Apply License Certification - user-facing
  "/invoices/payments", // Payments - typically seafarer-facing
];

function isExcludedForSuperAdmin(href: string): boolean {
  if (!href || href === "#") return false;
  const normalized = href.replace(/^\//, "").toLowerCase();
  return SUPER_ADMIN_EXCLUDED_HREFS.some((excluded) => {
    const normExcluded = excluded.replace(/^\//, "").toLowerCase();
    return normalized === normExcluded || normalized.startsWith(normExcluded);
  });
}

/**
 * For Super Admin: keep only administrative menu items (Admin Dashboard, Services,
 * Onboarding, Inspections, Audits, Applications Review, Institutions, etc.).
 * Remove agent/seafarer-facing items and put Admin Dashboard first.
 */
function filterMenuForSuperAdmin(menuItems: MenuItem[]): MenuItem[] {
  const filtered: MenuItem[] = [];

  for (const item of menuItems) {
    // Skip root-level items that are agent/seafarer-only
    if (isExcludedForSuperAdmin(item.href)) continue;
    // Skip items with no URL that are not useful as parents (e.g. Menu, Permissions, Report, etc. with url null)
    if (!item.href || item.href === "#") {
      // Keep if it has children we might show after filtering
      const filteredChildren =
        item.children?.filter(
          (c) => c.href && c.href !== "#" && !isExcludedForSuperAdmin(c.href)
        ) ?? [];
      if (filteredChildren.length > 0) {
        filtered.push({ ...item, children: filteredChildren });
      }
      continue;
    }

    // Filter children for this item
    const filteredChildren =
      item.children?.filter(
        (c) => c.href && c.href !== "#" && !isExcludedForSuperAdmin(c.href)
      ) ?? [];
    const hasUsableChildren =
      filteredChildren.length > 0 &&
      (item.children?.length ?? 0) > 0;

    filtered.push({
      ...item,
      children: hasUsableChildren ? filteredChildren : undefined,
    });
  }

  // Put Admin Dashboard first (match by href or normalized title "Dashboard")
  const adminDashboardIndex = filtered.findIndex(
    (item) =>
      item.href === ADMIN_DASHBOARD_HREF ||
      item.title?.toLowerCase() === "admin dashboard" ||
      item.title?.toLowerCase() === "dashboard"
  );
  if (adminDashboardIndex > 0) {
    const [adminItem] = filtered.splice(adminDashboardIndex, 1);
    filtered.unshift(adminItem);
  }

  return filtered;
}

// ============================================================================
// Sidebar Component
// ============================================================================

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [itemJustExpanded, setItemJustExpanded] = React.useState<string | null>(
    null
  );
  const expandableItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const savedScrollTopRef = useRef(0);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [apiMenuItems, setApiMenuItems] = React.useState<MenuItem[]>([]);
  const [useApiMenu, setUseApiMenu] = React.useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = React.useState(true);

  // Check if onboarding is complete - if not, don't render sidebar
  // BUT EXCLUDE ADMINS - admins should always see the sidebar
  const userRoleFromStorage =
    typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isAdmin =
    userRoleFromStorage?.toUpperCase() === "ADMIN" ||
    userRoleFromStorage?.toUpperCase() === "SUPERADMIN";

  // Skip onboarding check for admins
  if (!isAdmin) {
    const seaFarerWorkspace = getSeaFarerWorkspace(user);
    const hasSeaFarerWorkspace = seaFarerWorkspace !== null;
    const isOnboardingComplete =
      isSeaFarerOnboardingComplete(user) ??
      user?.is_onboarding_complete ??
      false;
    const isOnboardingPage =
      pathname === "/onboarding" || pathname.startsWith("/onboarding/");
    const isRootPage = pathname === "/" || pathname === "";

    // Don't render sidebar if user has Sea Farer workspace but onboarding is not complete
    // Allow root page for role selection, but hide sidebar on onboarding pages
    if (
      hasSeaFarerWorkspace &&
      !isOnboardingComplete &&
      (isOnboardingPage || isRootPage)
    ) {
      return null;
    }
  }

  // Get role from localStorage (set by loading page)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  // workspaceId from URL (when navigating from IMS dashboard with ?workspaceId=...)
  const workspaceIdFromUrl = searchParams.get("workspaceId")?.trim() || null;

  // Fetch menu from API and permissions
  React.useEffect(() => {
    const fetchMenuAndPermissions = async () => {
      if (!user) {
        setIsLoadingMenu(false);
        return;
      }

      try {
        setIsLoadingMenu(true);

        // WorkspaceId for menu: prefer URL (from IMS dashboard), then store, then user's first workspace
        const workspaceId =
          workspaceIdFromUrl ||
          currentWorkspaceId ||
          user.workspaces?.[0]?.workspaceId ||
          (user.workspaces as any)?.[0]?.id ||
          undefined;

        // Fetch menu items (GET /api/menu?workspaceId=... on SSO base URL)
        let menuResponse: Awaited<ReturnType<typeof getMenu>> | null = null;
        try {
          menuResponse = await getMenu(workspaceId);
        } catch (menuErr) {
          console.warn(
            "Failed to fetch menu from API, falling back to role-based menu:",
            menuErr
          );
          setUseApiMenu(false);
          setIsLoadingMenu(false);
          return;
        }

        if (menuResponse?.success && menuResponse?.data) {
          let filteredMenus = menuResponse.data;

          // If we have a workspaceId, fetch permissions and filter menu (optional - show menu even if this fails)
          if (workspaceId) {
            try {
              const permissionsResponse = await getMyPermissions(workspaceId);
              if (permissionsResponse.success && permissionsResponse.data) {
                filteredMenus = filterMenuByPermissions(
                  menuResponse.data,
                  permissionsResponse.data
                );
              }
            } catch (permError) {
              console.warn(
                "Failed to fetch permissions, showing all menu items:",
                permError
              );
              // Keep filteredMenus as menuResponse.data so we still show the menu
            }
          }

          // Convert API menu items to sidebar menu format (may be empty if resources: [])
          let convertedMenuItems = convertApiMenuToSidebarMenu(filteredMenus);

          // Super Admin in seafarer module: only show Dashboard, and it must be first
          if (isSuperAdminInSeafarer(user, workspaceId)) {
            convertedMenuItems = filterMenuForSuperAdmin(convertedMenuItems);
          }

          // Always use API menu when the API succeeded - empty resources means show no items
          setApiMenuItems(convertedMenuItems);
          setUseApiMenu(true);
        } else {
          setUseApiMenu(false);
        }
      } catch (error) {
        console.warn(
          "Failed to fetch menu from API, falling back to role-based menu:",
          error
        );
        setUseApiMenu(false);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenuAndPermissions();
    // Re-fetch when workspaceId from URL or store changes (e.g. landing from IMS with ?workspaceId=...)
  }, [user, currentWorkspaceId, workspaceIdFromUrl]);

  // Get menu items - use API menu when API succeeded (even if empty); only fall back on API failure
  // While loading, sidebar shows skeleton (see nav below); no fallback menu is shown
  const currentMenuItems = useApiMenu
    ? apiMenuItems
    : userRole
      ? getMenuItemsByRole(userRole)
      : getMenuItems("admin"); // Fallback when no role

  const toggleExpand = (id: string) => {
    const isExpanding = !expandedItems.includes(id);
    if (isExpanding) {
      const scrollEl = scrollAreaRef.current;
      if (scrollEl && typeof scrollEl.scrollTop === "number") {
        savedScrollTopRef.current = scrollEl.scrollTop;
      }
      setItemJustExpanded(id);
    }
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Restore sidebar scroll position after expand (prevents jump to top when dropdown appears)
  useLayoutEffect(() => {
    if (!itemJustExpanded) return;
    const restore = () => {
      const el = scrollAreaRef.current;
      if (el && typeof el.scrollTop === "number") {
        el.scrollTop = savedScrollTopRef.current;
      }
    };
    restore();
    const raf = requestAnimationFrame(restore);
    const t0 = setTimeout(restore, 0);
    const t1 = setTimeout(restore, 50);
    const t2 = setTimeout(restore, 150);
    setItemJustExpanded(null);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [itemJustExpanded]);

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
      window.location.href = "https://ims.mems.ng";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "#") return false;
    // Exact match - this is the most important check
    if (pathname === href) return true;
    // For nested paths, only match if pathname starts with href followed by end of string, query, or hash
    // This prevents /seafarer/applications from matching /seafarer/applications/history
    if (pathname.startsWith(href)) {
      const nextChar = pathname[href.length];
      // Only match if href is at the end of pathname, or followed by query/hash
      // This ensures /seafarer/applications doesn't match /seafarer/applications/history
      return nextChar === undefined || nextChar === "?" || nextChar === "#";
    }
    return false;
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
    parentHref,
  }: {
    item: { title: string; href: string };
    isChild?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    parentHref?: string;
  }) => {
    // For child items, use exact match only (no startsWith to prevent multiple highlights)
    // For parent items, use isActive which checks exact match
    const active = isChild ? pathname === item.href : isActive(item.href);
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
              : "text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted border-transparent"
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
            : "text-sidebar-foreground hover:bg-sidebar-muted"
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

      <div
        ref={scrollAreaRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 sidebar-scroll"
        style={{ overflowAnchor: "none" } as React.CSSProperties}
        role="region"
        aria-label="Sidebar menu"
      >
        <div className="px-3 mb-3">
          <span className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
            {isLoadingMenu ? (
              <Skeleton className="h-3 w-20" />
            ) : userRole ? (
              userRole.replace(/_/g, " ")
            ) : (
              "Workspace"
            )}
          </span>
        </div>

        {isLoadingMenu ? (
          <nav className="space-y-1" aria-busy="true" aria-label="Loading menu">
            {[70, 85, 60, 90, 75, 65].map((widthPct, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              >
                <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                <Skeleton
                  className="h-4 flex-1 rounded"
                  style={{ maxWidth: `${widthPct}%` }}
                />
              </div>
            ))}
          </nav>
        ) : (
          <nav className="space-y-1">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.title);
              const isItemActive =
                isActive(item.href) || isChildActive(item.children);

              if (hasChildren) {
                // Check if any child is active (exact match only)
                const hasActiveChild =
                  item.children?.some((child) => {
                    return pathname === child.href;
                  }) || false;

                return (
                  <div
                    key={item.title}
                    ref={(el) => {
                      expandableItemRefs.current[item.title] = el;
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        toggleExpand(item.title);
                        (e.currentTarget as HTMLButtonElement).blur();
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-colors border",
                        hasActiveChild
                          ? "bg-[#1E40AF] border-[#3B82F6] text-white font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-muted border-transparent"
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
                          <NavLink
                            key={child.href}
                            item={child}
                            isChild
                            parentHref={item.href}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return <NavLink key={item.href} item={item} icon={Icon} />;
            })}
          </nav>
        )}
      </div>

      {/* Return to IMS Link */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm hover:bg-sidebar-muted text-sidebar-foreground"
          onClick={() => {
            const imsUrl = process.env.NEXT_PUBLIC_IMS_URL;
            if (imsUrl) {
              window.location.href = imsUrl;
            }
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
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
