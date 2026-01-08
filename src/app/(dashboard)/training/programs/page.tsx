"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  DataTable,
  DataTableColumn,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getPrograms,
  createProgram,
  updateProgram,
} from "@/lib/services/program-service";
import type { ProgramDto, CreateProgramDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";

export default function ProgramsManagementPage() {
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDto | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProgramDto>({
    programName: "",
    description: "",
    duration: "",
    eligibilityCriteria: "",
    applicationDeadline: "",
    tuitionFee: "",
    currency: "NGN",
    programType: "",
    department: "",
    degreeAwarded: "",
  });
  const pageSize = 20;

  useEffect(() => {
    loadPrograms();
  }, [currentPage, searchQuery, typeFilter]);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const programType = typeFilter !== "all" ? typeFilter : undefined;
      const response = await getPrograms({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
        programType,
      });

      if (response.success && response.data) {
        setPrograms(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        toast.error(response.message || "Failed to load programs");
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProgram(null);
    setFormData({
      programName: "",
      description: "",
      duration: "",
      eligibilityCriteria: "",
      applicationDeadline: "",
      tuitionFee: "",
      currency: "NGN",
      programType: "",
      department: "",
      degreeAwarded: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (program: ProgramDto) => {
    setSelectedProgram(program);
    setFormData({
      programName: program.programName || "",
      description: program.description || "",
      duration: program.duration || "",
      eligibilityCriteria: program.eligibilityCriteria || "",
      applicationDeadline: program.applicationDeadline || "",
      tuitionFee: program.tuitionFee || "",
      currency: program.currency || "NGN",
      programType: program.programType || "",
      department: program.department || "",
      degreeAwarded: program.degreeAwarded || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.programName) {
      toast.error("Program name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (selectedProgram) {
        response = await updateProgram(selectedProgram.id, formData);
      } else {
        response = await createProgram(formData);
      }

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success(
          selectedProgram
            ? "Program updated successfully"
            : "Program created successfully"
        );
        setIsDialogOpen(false);
        loadPrograms();
      } else {
        toast.error(
          response.message ||
            (selectedProgram
              ? "Failed to update program"
              : "Failed to create program")
        );
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    const cat = category || "General";
    const colors: Record<string, string> = {
      Mandatory: "bg-blue-100 text-blue-800",
      Safety: "bg-red-100 text-red-800",
      Deck: "bg-green-100 text-green-800",
      Engine: "bg-yellow-100 text-yellow-800",
      General: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[cat] || "bg-gray-100 text-gray-800"}>
        {cat}
      </Badge>
    );
  };

  const columns: DataTableColumn<ProgramDto>[] = [
    {
      id: "programName",
      header: "Program Name",
      accessorKey: "programName",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.programName || "N/A"}</p>
          {row.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "programType",
      header: "Type",
      accessorKey: "programType",
      cell: ({ row }) => getCategoryBadge(row.programType),
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department",
      cell: ({ row }) => <span className="text-sm">{row.department || "N/A"}</span>,
    },
    {
      id: "duration",
      header: "Duration",
      accessorKey: "duration",
      cell: ({ row }) => <span className="text-sm">{row.duration || "N/A"}</span>,
    },
    {
      id: "tuitionFee",
      header: "Fee",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.currency || "NGN"} {row.tuitionFee || "0"}
        </span>
      ),
    },
    {
      id: "courseCount",
      header: "Courses",
      accessorKey: "courseCount",
      cell: ({ row }) => (
        <Badge variant="outline">{row.courseCount || 0} courses</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/training?programId=${row.id}`}>View Courses</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Programs Management"
          description="Manage training programs and their details"
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Mandatory">Mandatory</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
            <SelectItem value="Deck">Deck</SelectItem>
            <SelectItem value="Engine">Engine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Programs Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : programs.length === 0 ? (
        <EmptyState
          title="No programs found"
          description="Create your first program to get started"
          action={{
            label: "Add Program",
            onClick: handleCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={programs}
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProgram ? "Edit Program" : "Create New Program"}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram
                ? "Update program information"
                : "Add a new program to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="programName">
                Program Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="programName"
                value={formData.programName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, programName: e.target.value })
                }
                placeholder="e.g., Basic Safety Training"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Program description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="programType">Program Type</Label>
                <Select
                  value={formData.programType || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, programType: value })
                  }
                >
                  <SelectTrigger id="programType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mandatory">Mandatory</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Deck">Deck</SelectItem>
                    <SelectItem value="Engine">Engine</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="e.g., Navigation"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 3 months"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  value={formData.tuitionFee || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tuitionFee: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency || "NGN"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
              <Textarea
                id="eligibilityCriteria"
                value={formData.eligibilityCriteria || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eligibilityCriteria: e.target.value,
                  })
                }
                placeholder="Eligibility requirements..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicationDeadline">
                  Application Deadline
                </Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={
                    formData.applicationDeadline
                      ? new Date(formData.applicationDeadline)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationDeadline: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="degreeAwarded">
                  Degree/Certificate Awarded
                </Label>
                <Input
                  id="degreeAwarded"
                  value={formData.degreeAwarded || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, degreeAwarded: e.target.value })
                  }
                  placeholder="e.g., Certificate of Completion"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            >
              {isSubmitting
                ? "Saving..."
                : selectedProgram
                  ? "Update Program"
                  : "Create Program"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

