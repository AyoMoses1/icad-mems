"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Eye,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import {
  getAllAccreditations,
  getAccreditationDetails,
  type AccreditedInstitutionDto,
  type InstitutionAccreditationDto,
} from "@/lib/services/accreditation-service";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof CheckCircle2;
  }
> = {
  Approved: {
    label: "Approved",
    variant: "default",
    icon: CheckCircle2,
  },
  Activated: {
    label: "Activated",
    variant: "default",
    icon: CheckCircle2,
  },
  "Under Review": {
    label: "Under Review",
    variant: "secondary",
    icon: Clock,
  },
  Pending: {
    label: "Pending",
    variant: "secondary",
    icon: Clock,
  },
  Rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
  },
  Draft: {
    label: "Draft",
    variant: "outline",
    icon: AlertCircle,
  },
};

export default function MyAccreditationsPage() {
  const router = useRouter();
  const [accreditations, setAccreditations] = useState<
    AccreditedInstitutionDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadAccreditations();
  }, [currentPage, statusFilter, typeFilter]);

  const loadAccreditations = async () => {
    setIsLoading(true);
    try {
      const response = await getAllAccreditations({
        pageNumber: currentPage,
        pageSize,
        sortDirection: "desc",
      });
      const ok = response.success ?? (response as any).successful;
      if ((ok || response.data) && response.data) {
        // Handle response data which is an array of AccreditedInstitutionDto
        const responseData = response.data as any;
        let data: AccreditedInstitutionDto[] = Array.isArray(responseData)
          ? responseData
          : responseData?.items || [];

        // Apply filters
        if (statusFilter !== "all") {
          data = data.filter(
            (acc: AccreditedInstitutionDto) =>
              acc.accreditationStatus?.toLowerCase() === statusFilter.toLowerCase() ||
              acc.accreditationStatus?.toLowerCase().replace(/\s+/g, "-") ===
                statusFilter.toLowerCase()
          );
        }

        if (typeFilter !== "all") {
          data = data.filter(
            (acc: AccreditedInstitutionDto) =>
              acc.institutionTypeDescription?.toLowerCase() === typeFilter.toLowerCase()
          );
        }

        setAccreditations(data);
        setTotalCount(data.length);
        setTotalPages(Math.ceil(data.length / pageSize));
      } else {
        toast.error(response.message || "Failed to load accreditations");
      }
    } catch (error: any) {
      console.error("Error loading accreditations:", error);
      toast.error(error?.message || "Failed to load accreditations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (accreditation: AccreditedInstitutionDto) => {
    try {
      const accreditationId = accreditation.accreditedInstitutionsId || accreditation.id;
      if (!accreditationId) {
        toast.error("Accreditation ID not found");
        return;
      }
      const response = await getAccreditationDetails(accreditationId);
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        // Navigate to a detail page or show in a dialog
        router.push(`/accreditations/${accreditationId}`);
      } else {
        toast.error(response.message || "Failed to load accreditation details");
      }
    } catch (error: any) {
      console.error("Error loading accreditation details:", error);
      toast.error("Failed to load accreditation details");
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const normalizedStatus = status.toUpperCase();
    const config =
      statusConfig[status] ||
      statusConfig[
        Object.keys(statusConfig).find(
          (key) => key.toLowerCase() === normalizedStatus.toLowerCase()
        ) || ""
      ] ||
      {
        label: status,
        variant: "secondary" as const,
        icon: AlertCircle,
      };

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const columns: DataTableColumn<AccreditedInstitutionDto>[] = [
    {
      id: "accreditedInstitutionName",
      header: "Institution Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.accreditedInstitutionName || "N/A"}
        </div>
      ),
    },
    {
      id: "institutionTypeDescription",
      header: "Type",
      cell: ({ row }) => (
        <div>
          {row.institutionTypeDescription || "N/A"}
        </div>
      ),
    },
    {
      id: "accreditationStatus",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.accreditationStatus),
    },
    {
      id: "accreditedInstitutionEmail",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.accreditedInstitutionEmail || "N/A"}
        </span>
      ),
    },
    {
      id: "accreditedInstitutionPhone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.accreditedInstitutionPhone || "N/A"}
        </span>
      ),
    },
    {
      id: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.expiryDate ? formatDate(row.expiryDate) : "N/A"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(row)}>
              <FileText className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.fileUrl && (
              <DropdownMenuItem
                onClick={() => window.open(row.fileUrl, "_blank")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Document
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Get unique statuses and types for filters
  const uniqueStatuses = Array.from(
    new Set(
      accreditations
        .map((acc) => acc.accreditationStatus)
        .filter((status): status is string => !!status)
    )
  );
  const uniqueTypes = Array.from(
    new Set(
      accreditations
        .map((acc) => acc.institutionTypeDescription)
        .filter((type): type is string => !!type)
    )
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Accreditations"
        description="View and manage your accreditation applications"
        actions={
          <Button onClick={() => router.push("/accreditations/apply")}>
            <Award className="mr-2 h-4 w-4" />
            Apply for Accreditation
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status.toLowerCase().replace(/\s+/g, "-")}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={loadAccreditations}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Accreditations Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : accreditations.length === 0 ? (
        <EmptyState
          title="No accreditations found"
          description="You haven't applied for any accreditations yet. Get started by applying for your first accreditation."
          action={{
            label: "Apply for Accreditation",
            onClick: () => router.push("/accreditations/apply"),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={accreditations}
          isLoading={isLoading}
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          searchable={false}
          getRowId={(row) => row.accreditedInstitutionsId || ""}
        />
      )}
    </div>
  );
}

