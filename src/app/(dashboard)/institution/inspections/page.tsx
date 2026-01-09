"use client";

import { useEffect, useState } from "react";
import { Calendar, Building2, User, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getInspectionSchedules,
  type InspectionScheduleDto,
} from "@/lib/services/inspection-service";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function InstitutionInspectionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [inspections, setInspections] = useState<InspectionScheduleDto[]>([]);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setIsLoading(true);
      const response = await getInspectionSchedules({ pageSize: 100 });
      if (response.success) {
        setInspections(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load inspections:", error);
      toast.error("Failed to load inspection schedules");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Inspections"
        description="View upcoming and past inspections for your institution"
      />

      <Card>
        <CardHeader>
          <CardTitle>My Inspections ({inspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inspections scheduled</p>
              <p className="text-sm mt-2">
                Inspections will appear here when scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{inspection.inspectionType}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {inspection.scheduledDate
                            ? format(new Date(inspection.scheduledDate), "PPP 'at' p")
                            : "Not scheduled"}
                        </span>
                        {inspection.inspectorName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {inspection.inspectorName}
                          </span>
                        )}
                      </div>
                      {inspection.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {inspection.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[inspection.status] || "bg-gray-100"}>
                    {inspection.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





