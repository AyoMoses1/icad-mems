"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Simple progress bar component
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

export default function MyEnrollmentsPage() {
  const enrollments = [
    {
      id: "1",
      courseName: "STCW Basic Safety Training",
      institute: "Nigerian Maritime Academy",
      status: "upcoming",
      location: "Oron, Akwa Ibom",
      duration: "Dec 20, 2024 - Jan 3, 2025",
      progress: 0,
    },
    {
      id: "2",
      courseName: "Navigation Officer Grade II",
      institute: "Maritime Academy of Nigeria",
      status: "in-progress",
      location: "Lagos",
      duration: "Nov 1, 2024 - Apr 30, 2025",
      progress: 75,
    },
    {
      id: "3",
      courseName: "Advanced Fire Fighting",
      institute: "NIMASA Training Institute",
      status: "completed",
      location: "Apapa, Lagos",
      duration: "Oct 15, 2024 - Oct 22, 2024",
      progress: 100,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="info">Upcoming</Badge>;
      case "in-progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Enrollments"
        description="Track your current and past course enrollments"
      />

      <div className="space-y-4">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {enrollment.courseName}
                    </h3>
                    {getStatusBadge(enrollment.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {enrollment.institute}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{enrollment.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{enrollment.duration}</span>
                    </div>
                  </div>
                  {(enrollment.status === "in-progress" ||
                    enrollment.status === "completed") && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
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
    </div>
  );
}




