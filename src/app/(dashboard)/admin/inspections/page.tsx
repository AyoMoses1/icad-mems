"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getInspectionSchedules,
  createInspectionSchedule,
  type InspectionScheduleDto,
  type CreateInspectionScheduleRequest,
} from "@/lib/services/inspection-service";

const INSPECTION_TYPES = [
  { value: "Routine", label: "Routine Inspection" },
  { value: "Follow-up", label: "Follow-up Inspection" },
  { value: "Compliance", label: "Compliance Audit" },
  { value: "Special", label: "Special Investigation" },
];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function InspectionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [inspections, setInspections] = useState<InspectionScheduleDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating new inspection
  const [newInspection, setNewInspection] = useState<CreateInspectionScheduleRequest>({
    institutionId: "",
    scheduledDate: "",
    inspectionType: "Routine",
    notes: "",
  });

  useEffect(() => {
    loadInspections();
  }, [statusFilter]);

  const loadInspections = async () => {
    try {
      setIsLoading(true);
      const response = await getInspectionSchedules({
        status: statusFilter || undefined,
        pageSize: 100,
      });
      if (response.success) {
        setInspections(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load inspections:", error);
      toast.error("Failed to load inspections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInspection = async () => {
    if (!newInspection.institutionId || !newInspection.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createInspectionSchedule(newInspection);
      if (response.success) {
        toast.success("Inspection scheduled successfully");
        setIsDialogOpen(false);
        setNewInspection({
          institutionId: "",
          scheduledDate: "",
          inspectionType: "Routine",
          notes: "",
        });
        loadInspections();
      } else {
        toast.error(response.message || "Failed to create inspection");
      }
    } catch (error) {
      console.error("Failed to create inspection:", error);
      toast.error("Failed to create inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      !searchTerm ||
      inspection.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        title="Inspection Schedules"
        description="Manage and schedule inspections for institutions"
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by institution or inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule New Inspection</DialogTitle>
              <DialogDescription>
                Create a new inspection schedule for an institution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution ID *</Label>
                <Input
                  id="institutionId"
                  placeholder="Enter institution ID"
                  value={newInspection.institutionId}
                  onChange={(e) =>
                    setNewInspection({ ...newInspection, institutionId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newInspection.scheduledDate}
                  onChange={(e) =>
                    setNewInspection({ ...newInspection, scheduledDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspectionType">Inspection Type</Label>
                <Select
                  value={newInspection.inspectionType}
                  onValueChange={(value) =>
                    setNewInspection({ ...newInspection, inspectionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSPECTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={newInspection.notes || ""}
                  onChange={(e) =>
                    setNewInspection({ ...newInspection, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInspection} disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Inspection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Inspections ({filteredInspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInspections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inspections found</p>
              <p className="text-sm mt-2">
                Schedule a new inspection to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {inspection.institutionName || "Institution"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inspection.inspectionType}
                      </p>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_COLORS[inspection.status] || "bg-gray-100"}>
                      {getStatusIcon(inspection.status)}
                      <span className="ml-1">{inspection.status}</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/inspections/${inspection.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





