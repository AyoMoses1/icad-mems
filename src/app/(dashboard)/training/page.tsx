"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
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

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const courses = [
    {
      id: "1",
      name: "STCW Basic Safety Training",
      institute: "Nigerian Maritime Academy",
      category: "Mandatory",
      price: "₦150,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
    {
      id: "2",
      name: "Advanced Fire Fighting",
      institute: "NIMASA Training Institute",
      category: "Safety",
      price: "₦250,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
    {
      id: "3",
      name: "Navigation Officer Grade II",
      institute: "Maritime Academy of Nigeria",
      category: "Deck",
      price: "₦850,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
    {
      id: "4",
      name: "Marine Engineering Rating",
      institute: "Delta Maritime Institute",
      category: "Engine",
      price: "₦50,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
    {
      id: "5",
      name: "Survival Craft and Rescue Boats",
      institute: "Nigerian Maritime Academy",
      category: "Safety",
      price: "₦150,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
    {
      id: "6",
      name: "Medical First Aid",
      institute: "NIMASA Training Institute",
      category: "Safety",
      price: "₦150,000",
      duration: "2 weeks",
      startDate: "Jan 15, 2025",
      seatsAvailable: 15,
    },
  ];

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Mandatory: "bg-blue-100 text-blue-800",
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training"
        description="Browse and enroll in maritime training courses"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="mandatory">Mandatory</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="deck">Deck</SelectItem>
            <SelectItem value="engine">Engine</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Date
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                {getCategoryBadge(course.category)}
                <div className="text-right">
                  <p className="text-2xl font-bold">{course.price}</p>
                </div>
              </div>
              <CardTitle className="mt-4">{course.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {course.institute}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Starts: {course.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.seatsAvailable} seats available</span>
                </div>
              </div>
              <Button className="w-full bg-[#3EADC0] hover:bg-[#35a0b3]">
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




