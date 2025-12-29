"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Clock, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/shared";
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
import { getCourses } from "@/lib/services/course-service";
import type { CourseDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Settings } from "lucide-react";

export default function TrainingPage() {
  const router = useRouter();
  const { viewMode } = useUIStore();
  const isAdmin = viewMode === "admin";
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCourses();
  }, [currentPage, searchQuery, categoryFilter]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await getCourses({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchQuery || undefined,
      });

      const ok = response.success ?? (response as any).successful;
      if (ok && response.data) {
        let coursesData = response.data.items || [];

        // Filter by courseType if categoryFilter is not "all"
        if (categoryFilter !== "all") {
          coursesData = coursesData.filter(
            (course: any) => course.courseType === categoryFilter,
          );
        }

        setCourses(coursesData);
      } else {
        toast.error(response.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadge = (category: string | null | undefined) => {
    const cat = category || "General";
    const colors: Record<string, string> = {
      Mandatory: "bg-blue-100 text-blue-800",
      Preparatory: "bg-green-100 text-green-800",
      "Non-Conventional": "bg-purple-100 text-purple-800",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Training"
          description={
            isAdmin
              ? "Manage training programs and courses"
              : "Browse and enroll in maritime training courses"
          }
        />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/training/programs")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Programs
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/training/courses")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Courses
              </Button>
            </>
          )}
          <Button
            className="bg-[#3EADC0] hover:bg-[#35a0b3]"
            onClick={() => router.push("/training/enrollments")}
          >
            {isAdmin ? "All Enrollments" : "My Enrollments"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Mandatory">Mandatory</SelectItem>
            <SelectItem value="Preparatory">Preparatory</SelectItem>
            <SelectItem value="Non-Conventional">Non-Conventional</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Date
        </Button>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="There are no training courses available at this time"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  {getCategoryBadge((course as any).courseType)}
                  {(course as any).stcwCode && (
                    <Badge variant="outline" className="text-xs">
                      {(course as any).stcwCode}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">
                  {(course as any).name || course.courseName || "Course"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 h-10 line-clamp-2">
                  {(course as any).description ||
                    course.description ||
                    "No description available"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {(course as any).durationValue &&
                    (course as any).durationUnit && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Duration: {(course as any).durationValue}{" "}
                          {(course as any).durationUnit}
                        </span>
                      </div>
                    )}
                  {(course as any).approvalStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant={
                          (course as any).approvalStatus === "Approved"
                            ? "default"
                            : (course as any).approvalStatus === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {(course as any).approvalStatus}
                      </Badge>
                    </div>
                  )}
                  {(course as any).maxStudentTeacherRatio && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        Max Ratio: {(course as any).maxStudentTeacherRatio}:1
                      </span>
                    </div>
                  )}
                  {course.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(course.createdAt)}</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full bg-[#3EADC0] hover:bg-[#35a0b3]"
                  onClick={() => router.push(`/training/enrollments`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
