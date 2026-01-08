"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
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
  getDeficiencyReports,
  createDeficiencyReport,
  respondToDeficiency,
  resolveDeficiency,
  type DeficiencyReportDto,
  type CreateDeficiencyRequest,
  DEFICIENCY_SEVERITY,
  DEFICIENCY_TYPE,
  DEFICIENCY_STATUS,
} from "@/lib/services/deficiency-service";

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  RESPONDED: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default function DeficienciesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [deficiencies, setDeficiencies] = useState<DeficiencyReportDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [selectedDeficiency, setSelectedDeficiency] = useState<DeficiencyReportDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating new deficiency
  const [newDeficiency, setNewDeficiency] = useState<CreateDeficiencyRequest>({
    institutionId: "",
    deficiencyType: DEFICIENCY_TYPE.FACILITY,
    description: "",
    severity: DEFICIENCY_SEVERITY.MEDIUM,
    dueDate: "",
  });

  // Form state for responding to deficiency
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    loadDeficiencies();
  }, [statusFilter, severityFilter]);

  const loadDeficiencies = async () => {
    try {
      setIsLoading(true);
      const response = await getDeficiencyReports({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        pageSize: 100,
      });
      if (response.success) {
        setDeficiencies(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load deficiencies:", error);
      toast.error("Failed to load deficiency reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeficiency = async () => {
    if (!newDeficiency.institutionId || !newDeficiency.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createDeficiencyReport(newDeficiency);
      if (response.success) {
        toast.success("Deficiency report created successfully");
        setIsCreateDialogOpen(false);
        setNewDeficiency({
          institutionId: "",
          deficiencyType: DEFICIENCY_TYPE.FACILITY,
          description: "",
          severity: DEFICIENCY_SEVERITY.MEDIUM,
          dueDate: "",
        });
        loadDeficiencies();
      } else {
        toast.error(response.message || "Failed to create deficiency report");
      }
    } catch (error) {
      console.error("Failed to create deficiency:", error);
      toast.error("Failed to create deficiency report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondToDeficiency = async () => {
    if (!selectedDeficiency || !responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await respondToDeficiency(selectedDeficiency.id, {
        response: responseText,
      });
      if (response.success) {
        toast.success("Response submitted successfully");
        setIsRespondDialogOpen(false);
        setSelectedDeficiency(null);
        setResponseText("");
        loadDeficiencies();
      } else {
        toast.error(response.message || "Failed to submit response");
      }
    } catch (error) {
      console.error("Failed to respond:", error);
      toast.error("Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveDeficiency = async (deficiencyId: string) => {
    try {
      const response = await resolveDeficiency(deficiencyId, {
        resolved: true,
        notes: "Deficiency resolved after verification",
      });
      if (response.success) {
        toast.success("Deficiency resolved successfully");
        loadDeficiencies();
      } else {
        toast.error(response.message || "Failed to resolve deficiency");
      }
    } catch (error) {
      console.error("Failed to resolve:", error);
      toast.error("Failed to resolve deficiency");
    }
  };

  const filteredDeficiencies = deficiencies.filter((deficiency) => {
    const matchesSearch =
      !searchTerm ||
      deficiency.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deficiency.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        title="Deficiency Reports"
        description="Manage deficiency reports for institutions"
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deficiencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {Object.entries(DEFICIENCY_STATUS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Severity</SelectItem>
              {Object.entries(DEFICIENCY_SEVERITY).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Deficiency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Deficiency Report</DialogTitle>
              <DialogDescription>
                Report a deficiency found during inspection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution ID *</Label>
                <Input
                  id="institutionId"
                  placeholder="Enter institution ID"
                  value={newDeficiency.institutionId}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, institutionId: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deficiency Type</Label>
                  <Select
                    value={newDeficiency.deficiencyType}
                    onValueChange={(value) =>
                      setNewDeficiency({ ...newDeficiency, deficiencyType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEFICIENCY_TYPE).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={newDeficiency.severity}
                    onValueChange={(value) =>
                      setNewDeficiency({ ...newDeficiency, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEFICIENCY_SEVERITY).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newDeficiency.dueDate || ""}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the deficiency..."
                  rows={4}
                  value={newDeficiency.description || ""}
                  onChange={(e) =>
                    setNewDeficiency({ ...newDeficiency, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDeficiency} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Deficiency</DialogTitle>
            <DialogDescription>
              Provide a response to the deficiency report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDeficiency && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedDeficiency.deficiencyType}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDeficiency.description}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="response">Your Response *</Label>
              <Textarea
                id="response"
                placeholder="Describe the actions taken or planned..."
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRespondDialogOpen(false);
                setSelectedDeficiency(null);
                setResponseText("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRespondToDeficiency} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deficiencies List */}
      <Card>
        <CardHeader>
          <CardTitle>Deficiency Reports ({filteredDeficiencies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeficiencies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deficiency reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeficiencies.map((deficiency) => (
                <div
                  key={deficiency.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{deficiency.deficiencyType}</p>
                          <Badge className={SEVERITY_COLORS[deficiency.severity]}>
                            {deficiency.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {deficiency.institutionName || "Unknown Institution"}
                        </p>
                        <p className="text-sm mt-2">{deficiency.description}</p>
                        {deficiency.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {format(new Date(deficiency.dueDate), "PPP")}
                          </p>
                        )}
                        {deficiency.response && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <p className="font-medium text-blue-800">Response:</p>
                            <p className="text-blue-700">{deficiency.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={STATUS_COLORS[deficiency.status]}>
                        {deficiency.status}
                      </Badge>
                      <div className="flex gap-2">
                        {deficiency.status === "OPEN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDeficiency(deficiency);
                              setIsRespondDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                        {deficiency.status === "RESPONDED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleResolveDeficiency(deficiency.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
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



