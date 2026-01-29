"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  GraduationCap,
  ArrowLeft,
  Loader2,
  Search,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface FormData {
  seafarerRn: string;
  seafarerName: string;
  courseCode: string;
  courseName: string;
  result: string;
  score: string;
  examDate: string;
}

// Mock seafarer search - replace with actual API
const mockSearchSeafarer = async (rn: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data - in production, this would call an API
  const mockSeafarers: Record<string, { name: string; id: string }> = {
    "SEA-2026-0001": { name: "John Doe", id: "1" },
    "SEA-2026-0002": { name: "Jane Smith", id: "2" },
    "SEA-2026-0003": { name: "Michael Johnson", id: "3" },
  };

  return mockSeafarers[rn] || null;
};

// Mock courses - replace with actual API
const courses = [
  { code: "STCW-PST", name: "Personal Survival Techniques" },
  { code: "STCW-FF", name: "Fire Fighting" },
  { code: "STCW-EFA", name: "Elementary First Aid" },
  { code: "STCW-PSCRB", name: "Personal Safety and Social Responsibilities" },
  { code: "STCW-SSO", name: "Ship Security Officer" },
  { code: "STCW-GMDSS", name: "Global Maritime Distress and Safety System" },
];

export default function UploadTrainingResultPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [seafarerFound, setSeafarerFound] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const [formData, setFormData] = useState<FormData>({
    seafarerRn: "",
    seafarerName: "",
    courseCode: "",
    courseName: "",
    result: "",
    score: "",
    examDate: "",
  });

  // Auto-fill course name when course code is selected
  useEffect(() => {
    if (formData.courseCode) {
      const course = courses.find((c) => c.code === formData.courseCode);
      if (course) {
        setFormData((prev) => ({ ...prev, courseName: course.name }));
      }
    }
  }, [formData.courseCode]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSearchSeafarer = async () => {
    if (!formData.seafarerRn) {
      toast.error("Please enter a registration number");
      return;
    }

    setIsSearching(true);
    setSeafarerFound(null);

    try {
      const result = await mockSearchSeafarer(formData.seafarerRn);
      if (result) {
        setSeafarerFound(result);
        setFormData((prev) => ({ ...prev, seafarerName: result.name }));
        toast.success(`Found seafarer: ${result.name}`);
      } else {
        toast.error(
          "Seafarer not found. Please check the registration number.",
        );
      }
    } catch (error) {
      toast.error("Error searching for seafarer");
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.seafarerRn.trim()) {
      newErrors.seafarerRn = "Seafarer registration number is required";
    }
    if (!formData.courseCode) {
      newErrors.courseCode = "Course code is required";
    }
    if (!formData.result) {
      newErrors.result = "Result is required";
    }
    if (!formData.examDate) {
      newErrors.examDate = "Exam date is required";
    }
    if (
      formData.score &&
      (parseFloat(formData.score) < 0 || parseFloat(formData.score) > 100)
    ) {
      newErrors.score = "Score must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seafarerFound) {
      toast.error("Please search and verify the seafarer first");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // const response = await uploadTrainingResult({
      //   seafarerId: seafarerFound.id,
      //   ...formData,
      // });

      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      setIsSuccess(true);
      toast.success("Training result uploaded successfully");
    } catch (error) {
      console.error("Error uploading result:", error);
      toast.error("Failed to upload training result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      seafarerRn: "",
      seafarerName: "",
      courseCode: "",
      courseName: "",
      result: "",
      score: "",
      examDate: "",
    });
    setSeafarerFound(null);
    setIsSuccess(false);
    setErrors({});
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="rounded-full bg-green-100 p-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center">
          Result Uploaded Successfully!
        </h2>
        <p className="text-muted-foreground text-center">
          The training result has been recorded for {seafarerFound?.name}.
        </p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={resetForm}>
            Upload Another Result
          </Button>
          <Button onClick={() => router.push("/institution/training-results")}>
            View All Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Upload Training Result
          </h1>
          <p className="text-muted-foreground mt-1">
            Record a training result for a seafarer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seafarer Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seafarer Information
            </CardTitle>
            <CardDescription>
              Search for the seafarer by their registration number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seafarerRn">
                Seafarer Registration Number (RN) *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="seafarerRn"
                  placeholder="e.g., SEA-2026-0001"
                  value={formData.seafarerRn}
                  onChange={(e) => {
                    handleChange("seafarerRn", e.target.value);
                    setSeafarerFound(null);
                  }}
                  className={errors.seafarerRn ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSearchSeafarer}
                  disabled={isSearching || !formData.seafarerRn}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.seafarerRn && (
                <p className="text-sm text-red-500">{errors.seafarerRn}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Enter the seafarer&apos;s registration number and click search
              </p>
            </div>

            {seafarerFound && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Seafarer Found</p>
                    <p className="text-sm text-green-700">
                      {seafarerFound.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course & Result Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Course & Result Details
            </CardTitle>
            <CardDescription>
              Enter the training course details and result
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Select
                  value={formData.courseCode}
                  onValueChange={(value) => handleChange("courseCode", value)}
                >
                  <SelectTrigger
                    className={errors.courseCode ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseCode && (
                  <p className="text-sm text-red-500">{errors.courseCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  placeholder="Course name"
                  value={formData.courseName}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="examDate">Exam Date *</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleChange("examDate", e.target.value)}
                  className={errors.examDate ? "border-red-500" : ""}
                />
                {errors.examDate && (
                  <p className="text-sm text-red-500">{errors.examDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Result *</Label>
                <Select
                  value={formData.result}
                  onValueChange={(value) => handleChange("result", value)}
                >
                  <SelectTrigger
                    className={errors.result ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASS">Pass</SelectItem>
                    <SelectItem value="FAIL">Fail</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {errors.result && (
                  <p className="text-sm text-red-500">{errors.result}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Score (Optional)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={formData.score}
                  onChange={(e) => handleChange("score", e.target.value)}
                  className={errors.score ? "border-red-500" : ""}
                />
                {errors.score && (
                  <p className="text-sm text-red-500">{errors.score}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentage (0-100)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !seafarerFound}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Result"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
