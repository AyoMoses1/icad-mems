"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  DataTable,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEnrollments,
  createEnrollment,
} from "@/lib/services/enrollment-service";
import { getCohorts } from "@/lib/services/cohorts-service";
import { getSeafarers, getMySeafarer } from "@/lib/services/seafarers";
import { getCourses } from "@/lib/services/course-service";
import type { EnrollmentDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/store";

const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div
    className={`h-2 w-full bg-muted rounded-full overflow-hidden ${className}`}
  >
    <div
      className="h-full bg-primary transition-all rounded-full"
      style={{ width: `${value}%` }}
    />
  </div>
);

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    progress: number;
  }
> = {
  Upcoming: { label: "Upcoming", variant: "secondary", progress: 0 },
  "In Progress": { label: "In Progress", variant: "default", progress: 50 },
  Completed: { label: "Completed", variant: "default", progress: 100 },
  Cancelled: { label: "Cancelled", variant: "destructive", progress: 0 },
};

export default function MyEnrollmentsPage() {
  const { viewMode } = useUIStore();
  const { user } = useAuthStore();
  const isAdmin = viewMode === "admin";
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [seafarers, setSeafarers] = useState<any[]>([]);
  const [mySeafarerId, setMySeafarerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    cohortId: "",
    studentId: "",
    enrollmentDate: "",
  });
  const pageSize = 20;

  useEffect(() => {
    loadEnrollments();
    loadCohorts();
    loadCourses();
    if (isAdmin) {
      loadSeafarers();
    } else {
      loadMySeafarer();
    }
  }, [currentPage, isAdmin]);

  const loadEnrollments = async () => {
    setIsLoading(true);
    try {
      // For admin, get all enrollments; for user, get only their enrollments
      // (API should filter by current user if applicantId is not provided)
      const response = await getEnrollments({
        pageNumber: currentPage,
        pageSize,
        // Don't filter by applicantId for admin - show all
        // API will filter by current user if applicantId is not provided for regular users
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setEnrollments(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        toast.error(response.message || "Failed to fetch enrollments");
      }
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast.error("Failed to load enrollments");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const statusKey = status || "Upcoming";
    const config = statusConfig[statusKey] || statusConfig.Upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgress = (status: string | null | undefined) => {
    const statusKey = status || "Upcoming";
    const config = statusConfig[statusKey] || statusConfig.Upcoming;
    return config.progress;
  };

  const loadCohorts = async () => {
    try {
      const response = await getCohorts({ pageNumber: 1, pageSize: 100 });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setCohorts(response.data.items || []);
      }
    } catch (error) {
      console.error("Error loading cohorts:", error);
    }
  };

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

  const loadSeafarers = async () => {
    try {
      const response = await getSeafarers({ pageNumber: 1, pageSize: 100 });
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setSeafarers(response.data.items || []);
      }
    } catch (error) {
      console.error("Error loading seafarers:", error);
    }
  };

  const loadMySeafarer = async () => {
    try {
      const response = await getMySeafarer();
      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        setMySeafarerId(response.data.id);
      }
    } catch (error) {
      console.error("Error loading my seafarer:", error);
    }
  };

  const handleCreate = () => {
    setFormData({
      cohortId: "",
      studentId: isAdmin ? "" : mySeafarerId,
      enrollmentDate: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.cohortId ||
      (!isAdmin && !formData.studentId && !mySeafarerId)
    ) {
      toast.error("Cohort and student are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const enrollmentData = {
        cohortId: formData.cohortId,
        studentId: formData.studentId || mySeafarerId || "",
        enrollmentDate: formData.enrollmentDate
          ? new Date(formData.enrollmentDate).toISOString()
          : undefined,
      };

      const response = await createEnrollment(enrollmentData as any);
      const ok = response.success ?? (response as any).successful;
      if (ok) {
        toast.success("Enrollment created successfully");
        setIsDialogOpen(false);
        setFormData({ cohortId: "", studentId: "", enrollmentDate: "" });
        loadEnrollments();
      } else {
        toast.error(response.message || "Failed to create enrollment");
      }
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      toast.error(error?.message || "Failed to create enrollment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      id: "courseName",
      header: "Course",
      cell: ({ row }: { row: EnrollmentDto }) => (
        <div>
          <p className="font-medium">{row.courseName || "N/A"}</p>
          {row.courseCode && (
            <p className="text-sm text-muted-foreground">{row.courseCode}</p>
          )}
        </div>
      ),
    },
    {
      id: "studentId",
      header: "Student",
      cell: ({ row }: { row: EnrollmentDto }) => (
        <span>{row.studentId?.toString() || "N/A"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: EnrollmentDto }) => getStatusBadge(row.status),
    },
    {
      id: "enrollmentDate",
      header: "Enrollment Date",
      cell: ({ row }: { row: EnrollmentDto }) => (
        <span className="text-sm">
          {row.enrollmentDate ? formatDate(row.enrollmentDate) : "N/A"}
        </span>
      ),
    },
    {
      id: "grade",
      header: "Grade",
      cell: ({ row }: { row: EnrollmentDto }) => (
        <span className="text-sm">{row.grade || "N/A"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={isAdmin ? "All Enrollments" : "My Enrollments"}
          description={
            isAdmin
              ? "View and manage all course enrollments"
              : "Track your current and past course enrollments"
          }
        />
        <Button
          onClick={handleCreate}
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Enrollment
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="You haven't enrolled in any courses yet"
          action={{
            label: "Add Enrollment",
            onClick: handleCreate,
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={enrollments}
              currentPage={currentPage}
              totalCount={enrollments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      )}

      {/* Create Enrollment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Enrollment</DialogTitle>
            <DialogDescription>
              Enroll a student in a course cohort
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cohortId">
                Cohort <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.cohortId}
                onValueChange={(value) =>
                  setFormData({ ...formData, cohortId: value })
                }
              >
                <SelectTrigger id="cohortId">
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => {
                    const course = courses.find(
                      (c) => c.id === cohort.courseId,
                    );
                    const courseName =
                      course?.name || cohort.courseId || "Unknown Course";
                    const startDate = cohort.startDate
                      ? new Date(cohort.startDate).toLocaleDateString()
                      : "";
                    const endDate = cohort.endDate
                      ? new Date(cohort.endDate).toLocaleDateString()
                      : "";
                    return (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {courseName} ({startDate} - {endDate})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="grid gap-2">
                <Label htmlFor="studentId">
                  Student <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentId: value })
                  }
                >
                  <SelectTrigger id="studentId">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {seafarers.map((seafarer) => (
                      <SelectItem key={seafarer.id} value={seafarer.id}>
                        {seafarer.firstName} {seafarer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentDate: e.target.value })
                }
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
              {isSubmitting ? "Creating..." : "Create Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
