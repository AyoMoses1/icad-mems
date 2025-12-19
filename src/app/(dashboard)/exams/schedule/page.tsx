"use client";

import { MapPin, Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamSchedulePage() {
  const exams = [
    {
      id: "1",
      name: "Navigation Officer Grade II - Written",
      location: "Oron, Akwa Ibom",
      dateRange: "Dec 20, 2024 - Jan 3, 2025",
      time: "10:00 AM (WAT)",
    },
    {
      id: "2",
      name: "Navigation Officer Grade II - Written",
      location: "Oron, Akwa Ibom",
      dateRange: "Dec 20, 2024 - Jan 3, 2025",
      time: "10:00 AM (WAT)",
    },
    {
      id: "3",
      name: "Navigation Officer Grade II - Written",
      location: "Oron, Akwa Ibom",
      dateRange: "Dec 20, 2024 - Jan 3, 2025",
      time: "10:00 AM (WAT)",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Schedule"
        description="View upcoming examination dates and register"
      />

      <div className="space-y-4">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">{exam.name}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{exam.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{exam.dateRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{exam.time}</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-[#3EADC0] hover:bg-[#35a0b3]">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}




