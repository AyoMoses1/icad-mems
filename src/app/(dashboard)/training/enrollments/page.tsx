"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEnrollments } from "@/lib/services/enrollment-service";
import type { EnrollmentDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";

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
  const isAdmin = viewMode === "admin";
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadEnrollments();
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

      if (response.success && response.data) {
        setEnrollments(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error(response.message || "Failed to fetch enrollments");
      }

      if (response.success && response.data) {
        setEnrollments(response.data.items);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "All Enrollments" : "My Enrollments"}
        description={
          isAdmin
            ? "View and manage all course enrollments"
            : "Track your current and past course enrollments"
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="You haven't enrolled in any courses yet"
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {enrollment.courseName || "Course"}
                      </h3>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    {enrollment.programName && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {enrollment.programName}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {enrollment.enrollmentDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Enrolled: {formatDate(enrollment.enrollmentDate)}
                          </span>
                        </div>
                      )}
                      {enrollment.completionDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Completed: {formatDate(enrollment.completionDate)}
                          </span>
                        </div>
                      )}
                      {enrollment.grade && (
                        <div className="flex items-center gap-2">
                          <span>Grade: {enrollment.grade}</span>
                        </div>
                      )}
                    </div>
                    {(enrollment.status === "In Progress" ||
                      enrollment.status === "Completed") && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-bold">
                            {getProgress(enrollment.status)}%
                          </span>
                        </div>
                        <Progress
                          value={getProgress(enrollment.status)}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

