"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
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
import { Card, CardContent } from "@/components/ui/card";
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
import {
  getCohorts,
  createCohort,
  updateCohort,
  deleteCohort,
  type CohortDto,
  type CreateCohortRequest,
  type UpdateCohortRequest,
} from "@/lib/services/cohorts-service";
import { getCourses } from "@/lib/services/course-service";
import type { CourseDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";

export default function CohortsManagementPage() {
  const [cohorts, setCohorts] = useState<CohortDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCohortRequest>({
    courseId: "",
    startDate: "",
    endDate: "",
    instructorId: null,
    capacity: null,
    status: null,
  });
  const pageSize = 20;

  useEffect(() => {
    loadCohorts();
    loadCourses();
  }, [currentPage, searchQuery]);

  const loadCourses = async () => {
    try {
      const response = await getCourses({ pageNumber: 1, pageSize: 100 });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        const items = response.data.items || [];
        setCourses(items);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadCohorts = async () => {
    setIsLoading(true);
    try {
      const response = await getCohorts({
        pageNumber: currentPage,
        pageSize,
        sortDirection: "asc",
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        const items = response.data.items || [];
        setCohorts(items);
        setTotalCount(response.data.totalNumber || items.length);
      } else {
        toast.error(response.message || "Failed to load cohorts");
        setCohorts([]);
      }
    } catch (error) {
      console.error("Error loading cohorts:", error);
      toast.error("Failed to load cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCohort(null);
    setFormData({
      courseId: "",
      startDate: "",
      endDate: "",
      instructorId: null,
      capacity: null,
      status: null,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (cohort: CohortDto) => {
    setSelectedCohort(cohort);
    setFormData({
      courseId: cohort.courseId,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      instructorId: cohort.instructorId || null,
      capacity: cohort.capacity || null,
      status: cohort.status || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (cohort: CohortDto) => {
    setSelectedCohort(cohort);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.startDate || !formData.endDate) {
      toast.error("Course, start date, and end date are required");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (selectedCohort) {
        response = await updateCohort(selectedCohort.id, formData);
      } else {
        response = await createCohort(formData);
      }

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success(
          selectedCohort
            ? "Cohort updated successfully"
            : "Cohort created successfully",
        );
        setIsDialogOpen(false);
        loadCohorts();
      } else {
        toast.error(
          response.message ||
            (selectedCohort
              ? "Failed to update cohort"
              : "Failed to create cohort"),
        );
      }
    } catch (error) {
      console.error("Error saving cohort:", error);
      toast.error("Failed to save cohort");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCohort) return;

    setIsSubmitting(true);
    try {
      const response = await deleteCohort(selectedCohort.id);

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Cohort deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedCohort(null);
        loadCohorts();
      } else {
        toast.error(response.message || "Failed to delete cohort");
      }
    } catch (error) {
      console.error("Error deleting cohort:", error);
      toast.error("Failed to delete cohort");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || courseId || "Unknown Course";
  };

  const columns: DataTableColumn<CohortDto>[] = [
    {
      id: "course",
      header: "Course",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{getCourseName(row.courseId)}</p>
        </div>
      ),
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>
              {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "capacity",
      header: "Capacity",
      cell: ({ row }) => (
        <span className="text-sm">{row.capacity || "N/A"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.status || "Open";
        return (
          <Badge
            variant={
              status === "Open" || status === "Ongoing"
                ? "default"
                : status === "Completed"
                  ? "secondary"
                  : status === "Cancelled"
                    ? "destructive"
                    : "outline"
            }
          >
            {status}
          </Badge>
        );
      },
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
            <DropdownMenuItem onClick={() => handleEdit(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredCohorts = cohorts.filter((cohort) => {
    if (!searchQuery) return true;
    const courseName = getCourseName(cohort.courseId).toLowerCase();
    return courseName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Cohorts Management"
          description="Manage training cohorts and their schedules"
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Cohort
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts by course..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Cohorts Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredCohorts.length === 0 ? (
        <EmptyState
          title="No cohorts found"
          description="Create your first cohort to get started"
          action={{
            label: "Add Cohort",
            onClick: handleCreate,
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredCohorts}
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCohort ? "Edit Cohort" : "Create New Cohort"}
            </DialogTitle>
            <DialogDescription>
              {selectedCohort
                ? "Update cohort information"
                : "Add a new cohort to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courseId">
                Course <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: value })
                }
              >
                <SelectTrigger id="courseId">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name || course.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  min="0"
                  placeholder="Enter capacity"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value || null,
                    })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructorId">Instructor ID (Optional)</Label>
              <Input
                id="instructorId"
                value={formData.instructorId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructorId: e.target.value || null,
                  })
                }
                placeholder="Enter instructor ID"
              />
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
                : selectedCohort
                  ? "Update Cohort"
                  : "Create Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Cohort"
        description={`Are you sure you want to delete this cohort? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}

