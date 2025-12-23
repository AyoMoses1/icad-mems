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
import { getPrograms } from "@/lib/services/program-service";
import type { CourseDto, CreateCourseDto, ProgramDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCourseDto>({
    courseCode: "",
    courseName: "",
    description: "",
    credits: 0,
    semesterOffered: "",
    department: "",
    programId: 0,
  });
  const pageSize = 20;

  useEffect(() => {
    loadCourses();
    loadPrograms();
  }, [currentPage, searchQuery, programFilter]);

  const loadPrograms = async () => {
    try {
      const response = await getPrograms({ pageNumber: 1, pageSize: 1000 });
      if (response.success && response.data) {
        setPrograms(response.data.items);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const programId =
        programFilter !== "all" ? Number(programFilter) : undefined;
      const response = await getCourses({
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchQuery || undefined,
        programId,
      });

      if (response.success && response.data) {
        setCourses(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      } else {
        toast.error(response.message || "Failed to load courses");
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
      courseCode: "",
      courseName: "",
      description: "",
      credits: 0,
      semesterOffered: "",
      department: "",
      programId: programs[0]?.id || 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (course: CourseDto) => {
    setSelectedCourse(course);
    setFormData({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      description: course.description || "",
      credits: course.credits || 0,
      semesterOffered: course.semesterOffered || "",
      department: course.department || "",
      programId: course.programId || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (course: CourseDto) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.courseName || !formData.programId) {
      toast.error("Course name and program are required");
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

      if (response.success) {
        toast.success(
          selectedCourse
            ? "Course updated successfully"
            : "Course created successfully"
        );
        setIsDialogOpen(false);
        loadCourses();
      } else {
        toast.error(
          response.message ||
            (selectedCourse
              ? "Failed to update course"
              : "Failed to create course")
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

      if (response.success) {
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
      id: "courseCode",
      header: "Code",
      accessorKey: "courseCode",
      cell: (row) => (
        <span className="font-mono text-sm font-medium">
          {row.courseCode || "N/A"}
        </span>
      ),
    },
    {
      id: "courseName",
      header: "Course Name",
      accessorKey: "courseName",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.courseName || "N/A"}</p>
          {row.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "programName",
      header: "Program",
      accessorKey: "programName",
      cell: (row) => (
        <span className="text-sm">{row.programName || "N/A"}</span>
      ),
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department",
      cell: (row) => <span className="text-sm">{row.department || "N/A"}</span>,
    },
    {
      id: "credits",
      header: "Credits",
      accessorKey: "credits",
      cell: (row) => (
        <Badge variant="outline">{row.credits || 0} credits</Badge>
      ),
    },
    {
      id: "enrollmentCount",
      header: "Enrollments",
      accessorKey: "enrollmentCount",
      cell: (row) => (
        <span className="text-sm">{row.enrollmentCount || 0}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
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
        <Select
          value={programFilter}
          onValueChange={(value) => {
            setProgramFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.programName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Create your first course to get started"
          action={
            <Button
              onClick={handleCreate}
              className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          currentPage={currentPage}
          totalPages={totalPages}
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
              <Label htmlFor="programId">
                Program <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.programId?.toString() || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, programId: Number(value) })
                }
              >
                <SelectTrigger id="programId">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.programName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={formData.courseCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value })
                  }
                  placeholder="e.g., MAR101"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseName">
                  Course Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="courseName"
                  value={formData.courseName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                  placeholder="e.g., Basic Navigation"
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
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credits: Number(e.target.value),
                    })
                  }
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semesterOffered">Semester</Label>
                <Input
                  id="semesterOffered"
                  value={formData.semesterOffered || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semesterOffered: e.target.value,
                    })
                  }
                  placeholder="e.g., Fall 2024"
                />
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
        description={`Are you sure you want to delete "${selectedCourse?.courseName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isDestructive
        isLoading={isSubmitting}
      />
    </div>
  );
}

