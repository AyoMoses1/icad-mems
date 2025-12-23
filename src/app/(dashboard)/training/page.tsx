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
import { getPrograms } from "@/lib/services/program-service";
import type { ProgramDto } from "@/types/seafarer";
import { formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Settings } from "lucide-react";

export default function TrainingPage() {
  const router = useRouter();
  const { viewMode } = useUIStore();
  const isAdmin = viewMode === "admin";
  const [programs, setPrograms] = useState<ProgramDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPrograms();
  }, [currentPage, searchQuery, categoryFilter]);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await getPrograms({
        pageNumber: currentPage,
        pageSize: 20,
        searchTerm: searchQuery || undefined,
        programType: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      if (response.success && response.data) {
        setPrograms(response.data.items);
      } else {
        toast.error(response.message || "Failed to fetch programs");
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setIsLoading(false);
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
            <SelectItem value="Safety">Safety</SelectItem>
            <SelectItem value="Deck">Deck</SelectItem>
            <SelectItem value="Engine">Engine</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Date
        </Button>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : programs.length === 0 ? (
        <EmptyState
          title="No programs found"
          description="There are no training programs available at this time"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  {getCategoryBadge(program.programType)}
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {program.currency || "NGN"}
                    </span>
                    <p className="text-2xl font-bold">
                      {program.tuitionFee || "N/A"}
                    </p>
                  </div>
                </div>
                <CardTitle className="mt-4">
                  {program.programName || "Program"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {program.description || "No description available"}
                </p>
                {program.eligibilityCriteria && (
                  <p className="text-sm text-muted-foreground h-10 mt-1 line-clamp-2">
                    {program.eligibilityCriteria}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {program.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {program.duration}</span>
                    </div>
                  )}
                  {program.applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Deadline: {formatDate(program.applicationDeadline)}
                      </span>
                    </div>
                  )}
                  {program.courseCount !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{program.courseCount} courses</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full bg-[#3EADC0] hover:bg-[#35a0b3]"
                  onClick={() =>
                    router.push(`/training/enroll?id=${program.id}`)
                  }
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

