"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Calendar, MapPin, Users, Award, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiGetMain } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

const enrollmentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  seafarersBookNumber: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

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
  const courseId = searchParams.get("id");
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      try {
        if (!courseId) {
          toast.error("Course ID is required");
          router.push("/training");
          return;
        }

        const result = await apiGetMain<any>(`/api/v1/Programs/${courseId}`);

        if (result.success && result.data) {
          // Map API response to Course interface
          const courseData: Course = {
            id: result.data.id || courseId,
            programName: result.data.programName || result.data.name || "",
            description: result.data.description,
            programType: result.data.programType || result.data.category || "",
            tuitionFee: result.data.tuitionFee || 0,
            currency: result.data.currency || "₦",
            duration: result.data.duration || "",
            startDate: result.data.startDate || "",
            endDate: result.data.endDate || result.data.applicationDeadline,
            location: result.data.location || "",
            seatsAvailable: result.data.seatsAvailable,
            certificate: result.data.certificate,
            modules: result.data.modules || result.data.courseModules || [],
            institute: result.data.institute || result.data.academy || "",
          };
          setCourse(courseData);
        } else {
          toast.error(
            result.error?.message || "Failed to fetch course details",
          );
          router.push("/training");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load course details",
        );
        router.push("/training");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router]);

  const onSubmit = async (data: EnrollmentFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement enrollment API call
      // const result = await apiPostMain("/api/v1/Enrollments", {
      //   programId: courseId,
      //   ...data,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Enrollment successful! Redirecting to payment...");
      // router.push(`/training/payment?enrollmentId=${result.data.id}`);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll. Please try again.");
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

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Course not found</p>
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
        {/* Left Panel - Course Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              {getCategoryBadge(course.programType)}
            </div>
            <CardTitle className="text-2xl mb-2">
              {course.programName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-6">
              {course.institute || "Nigerian Maritime Academy"}
            </p>

            {/* Course Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{course.duration}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Dates:</span>
                <span className="font-medium">
                  {course.startDate ? formatDate(course.startDate) : "TBA"}
                  {course.endDate && ` - ${formatDate(course.endDate)}`}
                </span>
              </div>

              {course.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{course.location}</span>
                </div>
              )}

              {course.seatsAvailable !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium">
                    {course.seatsAvailable} seats available
                  </span>
                </div>
              )}

              {course.certificate && (
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Certificate:</span>
                  <span className="font-medium">{course.certificate}</span>
                </div>
              )}
            </div>

            {/* Course Modules */}
            {course.modules && course.modules.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Course Modules</h4>
                <ul className="space-y-2">
                  {course.modules.map((module, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{module}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Fee */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <span className="text-lg font-semibold">Course Fee</span>
              <span className="text-2xl font-bold text-primary">
                {course.currency}
                {course.tuitionFee.toLocaleString()}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Right Panel - Personal Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Name"
                    {...register("firstName")}
                    error={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Name"
                    {...register("lastName")}
                    error={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email"
                    {...register("email")}
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Number"
                    {...register("phoneNumber")}
                    error={!!errors.phoneNumber}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    placeholder="DOB"
                    {...register("dateOfBirth")}
                    error={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    placeholder="Nigerian"
                    {...register("nationality")}
                    error={!!errors.nationality}
                  />
                  {errors.nationality && (
                    <p className="text-sm text-destructive">
                      {errors.nationality.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter full address"
                  rows={3}
                  {...register("address")}
                  error={!!errors.address}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Seafarer's Book Number - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="seafarersBookNumber">
                  Seafarer&apos;s Book Number (if applicable)
                </Label>
                <Input
                  id="seafarersBookNumber"
                  placeholder="Enter Seafarer book number"
                  {...register("seafarersBookNumber")}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3EADC0] hover:bg-[#35a0b3]"
                >
                  {isSubmitting ? "Processing..." : "Enroll & Pay"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
