"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
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
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/services/course-service";
import { getCertificates } from "@/lib/services/certificates-service";
import type { CourseDto, CreateCourseDto } from "@/types/seafarer";
import type { CertificateDto } from "@/lib/services/certificates-service";
import { formatDate } from "@/lib/utils";

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCourseDto>({
    name: "",
    stcwCode: "",
    courseType: "",
    approvalStatus: "",
    durationValue: 0,
    durationUnit: "",
    description: "",
    maxStudentTeacherRatio: 0,
    certificateId: "",
  });
  const pageSize = 20;

  useEffect(() => {
    loadCourses();
    loadCertificates();
  }, [currentPage, searchQuery]);

  const loadCertificates = async () => {
    try {
      const response = await getCertificates({ pageNumber: 1, pageSize: 100 });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setCertificates(response.data.items || []);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await getCourses({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
      });

      if ((response.success ?? (response as any).successful) && response.data) {
        const data = response.data;
        const items =
          data && "items" in data
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
        setCourses(items || []);
      } else {
        toast.error(response.message || "Failed to load courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setFormData({
      name: "",
      stcwCode: "",
      courseType: "",
      approvalStatus: "",
      durationValue: 0,
      durationUnit: "",
      description: "",
      maxStudentTeacherRatio: 0,
      certificateId: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (course: CourseDto) => {
    setSelectedCourse(course);
    setFormData({
      name: (course as any).name || "",
      stcwCode: (course as any).stcwCode || "",
      courseType: (course as any).courseType || "",
      approvalStatus: (course as any).approvalStatus || "",
      durationValue: (course as any).durationValue || 0,
      durationUnit: (course as any).durationUnit || "",
      description: course.description || "",
      maxStudentTeacherRatio: (course as any).maxStudentTeacherRatio || 0,
      certificateId: (course as any).certificateId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (course: CourseDto) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.certificateId) {
      toast.error("Course name and certificate are required");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (selectedCourse) {
        response = await updateCourse(selectedCourse.id, formData);
      } else {
        response = await createCourse(formData);
      }

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success(
          selectedCourse
            ? "Course updated successfully"
            : "Course created successfully",
        );
        setIsDialogOpen(false);
        loadCourses();
      } else {
        toast.error(
          response.message ||
            (selectedCourse
              ? "Failed to update course"
              : "Failed to create course"),
        );
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      const response = await deleteCourse(selectedCourse.id);

      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Course deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
        loadCourses();
      } else {
        toast.error(response.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<CourseDto>[] = [
    {
      id: "name",
      header: "Course Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{(row as any).name || "N/A"}</p>
          {row.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "stcwCode",
      header: "STCW Code",
      accessorKey: "stcwCode",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          {(row as any).stcwCode || "N/A"}
        </span>
      ),
    },
    {
      id: "courseType",
      header: "Course Type",
      accessorKey: "courseType",
      cell: ({ row }) => (
        <span className="text-sm">{(row as any).courseType || "N/A"}</span>
      ),
    },
    {
      id: "approvalStatus",
      header: "Status",
      accessorKey: "approvalStatus",
      cell: ({ row }) => {
        const status = (row as any).approvalStatus || "Pending";
        return (
          <Badge
            variant={
              status === "Approved"
                ? "default"
                : status === "Rejected" || status === "Revoked"
                  ? "destructive"
                  : "secondary"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const value = (row as any).durationValue || 0;
        const unit = (row as any).durationUnit || "";
        return (
          <span className="text-sm">
            {value > 0 && unit ? `${value} ${unit}` : "N/A"}
          </span>
        );
      },
    },
    {
      id: "certificate",
      header: "Certificate",
      cell: ({ row }) => {
        const certId = (row as any).certificateId;
        const cert = certificates.find((c) => c.id === certId);
        return <span className="text-sm">{cert?.name || certId || "N/A"}</span>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Courses Management"
          description="Manage training courses and their details"
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Create your first course to get started"
          action={{
            label: "Add Course",
            onClick: handleCreate,
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Edit Course" : "Create New Course"}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse
                ? "Update course information"
                : "Add a new course to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Course Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Basic Navigation"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stcwCode">STCW Code</Label>
                <Input
                  id="stcwCode"
                  value={formData.stcwCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stcwCode: e.target.value })
                  }
                  placeholder="e.g., STCW A-II/1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseType">Course Type</Label>
                <Select
                  value={formData.courseType || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courseType: value })
                  }
                >
                  <SelectTrigger id="courseType">
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mandatory">Mandatory</SelectItem>
                    <SelectItem value="Preparatory">Preparatory</SelectItem>
                    <SelectItem value="Non-Conventional">
                      Non-Conventional
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="approvalStatus">Approval Status</Label>
                <Select
                  value={formData.approvalStatus || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, approvalStatus: value })
                  }
                >
                  <SelectTrigger id="approvalStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="certificateId">
                  Certificate <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.certificateId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, certificateId: value })
                  }
                >
                  <SelectTrigger id="certificateId">
                    <SelectValue placeholder="Select a certificate" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificates.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.name || cert.stcwCode || cert.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="durationValue">Duration Value</Label>
                <Input
                  id="durationValue"
                  type="number"
                  value={formData.durationValue || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationValue: Number(e.target.value),
                    })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationUnit">Duration Unit</Label>
                <Select
                  value={formData.durationUnit || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, durationUnit: value })
                  }
                >
                  <SelectTrigger id="durationUnit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxStudentTeacherRatio">
                  Max Student/Teacher Ratio
                </Label>
                <Input
                  id="maxStudentTeacherRatio"
                  type="number"
                  value={formData.maxStudentTeacherRatio || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStudentTeacherRatio: Number(e.target.value),
                    })
                  }
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Course description..."
                rows={3}
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
                : selectedCourse
                  ? "Update Course"
                  : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${(selectedCourse as any)?.name || "this course"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
