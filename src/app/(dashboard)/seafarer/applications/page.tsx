"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, MoreVertical, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LoadingSpinner,
  EmptyState,
  DataTable,
  DataTableColumn,
} from "@/components/shared";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { getApplications } from "@/lib/services/application-service";
import type { ApplicationDto } from "@/types/payment";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Pending: { label: "Pending", variant: "secondary" },
  Approved: { label: "Approved", variant: "default" },
  Rejected: { label: "Rejected", variant: "destructive" },
  InReview: { label: "In Review", variant: "outline" },
  Submitted: { label: "Submitted", variant: "secondary" },
};

export default function SeafarerApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 20;

  const tabs = [
    { id: "all", label: "All Applications" },
    { id: "Pending", label: "Pending Review" },
    { id: "Approved", label: "Approved" },
  ];

  useEffect(() => {
    loadApplications();
  }, [currentPage, searchQuery, selectedTab, statusFilter]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const statusId =
        selectedTab !== "all"
          ? selectedTab
          : statusFilter !== "all"
            ? statusFilter
            : undefined;

      const response = await getApplications({
        pageNumber: currentPage,
        pageSize,
        statusId: statusId ? parseInt(statusId) : undefined,
        searchTerm: searchQuery || undefined,
      });

      if (response.success && response.data) {
        setApplications(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        toast.error(response.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<ApplicationDto>[] = [
    {
      id: "applicationNumber",
      header: "Application Number",
      accessorKey: "applicationNumber",
      cell: (row) => (
        <span className="font-mono font-medium">
          {row.applicationNumber || `APP-${row.id}`}
        </span>
      ),
    },
    {
      id: "applicantName",
      header: "Applicant",
      accessorKey: "applicantName",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {row.applicantName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "APP"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.applicantName || "N/A"}</div>
            {row.programName && (
              <div className="text-sm text-muted-foreground">
                {row.programName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "programAppliedFor",
      header: "Program",
      accessorKey: "programAppliedFor",
      cell: (row) => (
        <span className="text-sm">
          {row.programAppliedFor || row.programName || "N/A"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const status = row.status || row.applicationStatusName || "Pending";
        const config = statusConfig[status] || statusConfig.Pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: "applicationDate",
      header: "Date",
      accessorKey: "applicationDate",
      cell: (row) => (
        <span className="text-sm">
          {row.applicationDate ? formatDate(row.applicationDate) : "N/A"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/seafarer/applications/${row.id}/review`}>
                <Eye className="mr-2 h-4 w-4" />
                Review Application
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Assign Reviewer</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Reject Application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="All applications awaiting initial review and assignment"
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              onClick={() => {
                setSelectedTab(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                selectedTab === tab.id &&
                  "bg-[#3EADC0] hover:bg-[#35a0b3] text-white"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="InReview">In Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8">
              <LoadingSpinner />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No applications found"
                description="There are no applications to display"
              />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={applications}
                isLoading={isLoading}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                searchable={false}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
