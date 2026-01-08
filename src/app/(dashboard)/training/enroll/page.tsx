"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Calendar, MapPin, Users, Award } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiGetMain } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { createEnrollment } from "@/lib/services/enrollment-service";
import { getCoursesByProgram } from "@/lib/services/course-service";
import { useAuthStore } from "@/store";
import type { CourseDto } from "@/types/seafarer";

interface Course {
  id: string;
  programName: string;
  description?: string;
  programType: string;
  tuitionFee: number;
  currency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  location?: string;
  seatsAvailable?: number;
  certificate?: string;
  modules?: string[];
  institute?: string;
}

export default function EnrollTrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get("id");
  const { user } = useAuthStore();
  const [program, setProgram] = useState<Course | null>(null);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProgramAndCourses = async () => {
      setIsLoading(true);
      try {
        if (!programId) {
          toast.error("Program ID is required");
          router.push("/training");
          return;
        }

        // Fetch program details
        const programResult = await apiGetMain<any>(
          `/api/v1/Programs/${programId}`
        );

        if (!programResult.success || !programResult.data) {
          toast.error(
            programResult.error?.message || "Failed to fetch program details"
          );
          router.push("/training");
          return;
        }

        // Map API response to Course interface (reusing for program display)
        const programData: Course = {
          id: programResult.data.id || programId,
          programName:
            programResult.data.programName || programResult.data.name || "",
          description: programResult.data.description,
          programType:
            programResult.data.programType || programResult.data.category || "",
          tuitionFee: programResult.data.tuitionFee || 0,
          currency: programResult.data.currency || "₦",
          duration: programResult.data.duration || "",
          startDate: programResult.data.startDate || "",
          endDate:
            programResult.data.endDate ||
            programResult.data.applicationDeadline,
          location: programResult.data.location || "",
          seatsAvailable: programResult.data.seatsAvailable,
          certificate: programResult.data.certificate,
          modules:
            programResult.data.modules ||
            programResult.data.courseModules ||
            [],
          institute:
            programResult.data.institute || programResult.data.academy || "",
        };
        setProgram(programData);

        // Fetch courses for this program
        const coursesResult = await getCoursesByProgram(Number(programId));

        if (coursesResult.success && coursesResult.data) {
          const coursesList = Array.isArray(coursesResult.data)
            ? coursesResult.data
            : [];
          setCourses(coursesList);

          // Auto-select first course if only one available
          if (coursesList.length === 1) {
            setSelectedCourseId(coursesList[0].id);
          }
        } else {
          console.warn("Could not fetch courses:", coursesResult.message);
          // Continue without courses - user can still try to enroll
        }
      } catch (error) {
        console.error("Error fetching program/courses:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load program details"
        );
        router.push("/training");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramAndCourses();
  }, [programId, router]);

  const onSubmit = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course to enroll in");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create enrollment
      // Note: enrollmentData expects cohortId and studentId
      // We use the selected course ID as cohort ID for now (may need to be updated based on actual flow)
      const result = await createEnrollment({
        cohortId: String(selectedCourseId),
        studentId: String(user?.id || ""), // Use the current user's ID
        enrollmentDate: new Date().toISOString(),
      });

      if (result.success && result.data) {
        toast.success("Enrollment successful! Redirecting to enrollments...");
        router.push("/training/enrollments");
      } else {
        toast.error(
          result.error?.message ||
            result.message ||
            "Failed to enroll. Please try again."
        );
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to enroll. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Mandatory: "bg-blue-500 text-white",
      Safety: "bg-red-100 text-red-800",
      Deck: "bg-green-100 text-green-800",
      Engine: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Program not found</p>
        <Button onClick={() => router.push("/training")}>
          Back to Training
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Enroll a Training"
          description="Enroll a training to gain expertise."
        />
        <Button
          className="bg-[#3EADC0] hover:bg-[#35a0b3]"
          onClick={() => router.push("/training/enrollments")}
        >
          My Enrollment
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Program Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              {getCategoryBadge(program.programType)}
            </div>
            <CardTitle className="text-2xl mb-2">
              {program.programName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-6">
              {program.institute || "Nigerian Maritime Academy"}
            </p>

            {/* Program Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{program.duration}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {program.startDate ? formatDate(program.startDate) : "TBA"}
                  {program.endDate && ` - ${formatDate(program.endDate)}`}
                </span>
              </div>

              {program.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{program.location}</span>
                </div>
              )}

              {program.seatsAvailable !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium">
                    {program.seatsAvailable} seats available
                  </span>
                </div>
              )}

              {program.certificate && (
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Certificate:</span>
                  <span className="font-medium">{program.certificate}</span>
                </div>
              )}
            </div>

            {/* Course Selection */}
            {courses.length > 0 && (
              <div className="mt-6">
                <Label
                  htmlFor="course-select"
                  className="font-semibold mb-3 block"
                >
                  Select Course
                </Label>
                <Select
                  value={selectedCourseId?.toString() || ""}
                  onValueChange={(value) => setSelectedCourseId(Number(value))}
                >
                  <SelectTrigger id="course-select">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.courseName ||
                          course.courseCode ||
                          `Course ${course.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Program Modules */}
            {program.modules && program.modules.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Program Modules</h4>
                <ul className="space-y-2">
                  {program.modules.map((module, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{module}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Program Fee */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <span className="text-lg font-semibold">Program Fee</span>
              <span className="text-2xl font-bold text-primary">
                {program.currency}
                {program.tuitionFee.toLocaleString()}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Right Panel - Enrollment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No courses available for this program. Please contact the
                  administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You are enrolling as:{" "}
                    <strong>
                      {user?.fullName || user?.email || "Current User"}
                    </strong>
                  </p>
                  {selectedCourseId && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">
                        Selected Course:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {courses.find((c) => c.id === selectedCourseId)
                          ?.courseName ||
                          courses.find((c) => c.id === selectedCourseId)
                            ?.courseCode ||
                          `Course ${selectedCourseId}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting || !selectedCourseId}
                    className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                  >
                    {isSubmitting ? "Processing..." : "Enroll Now"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
