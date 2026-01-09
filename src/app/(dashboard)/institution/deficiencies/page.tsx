"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Clock,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner, PageHeader } from "@/components/shared";
import {
  getDeficiencyReports,
  respondToDeficiency,
  type DeficiencyReportDto,
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

export default function InstitutionDeficienciesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [deficiencies, setDeficiencies] = useState<DeficiencyReportDto[]>([]);
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [selectedDeficiency, setSelectedDeficiency] = useState<DeficiencyReportDto | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDeficiencies();
  }, []);

  const loadDeficiencies = async () => {
    try {
      setIsLoading(true);
      const response = await getDeficiencyReports({ pageSize: 100 });
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

  const handleRespond = async () => {
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

  const openCount = deficiencies.filter((d) => d.status === "OPEN").length;
  const respondedCount = deficiencies.filter((d) => d.status === "RESPONDED").length;
  const resolvedCount = deficiencies.filter((d) => d.status === "RESOLVED").length;

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
        description="View and respond to deficiency reports for your institution"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{openCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Responded</p>
                <p className="text-2xl font-bold">{respondedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{resolvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Respond Dialog */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Deficiency</DialogTitle>
            <DialogDescription>
              Provide your response and any corrective actions taken
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDeficiency && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={SEVERITY_COLORS[selectedDeficiency.severity]}>
                    {selectedDeficiency.severity}
                  </Badge>
                  <span className="text-sm font-medium">
                    {selectedDeficiency.deficiencyType}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedDeficiency.description}
                </p>
                {selectedDeficiency.dueDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Due: {format(new Date(selectedDeficiency.dueDate), "PPP")}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="response">Your Response *</Label>
              <Textarea
                id="response"
                placeholder="Describe the corrective actions taken or planned..."
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
            <Button onClick={handleRespond} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deficiencies List */}
      <Card>
        <CardHeader>
          <CardTitle>Deficiency Reports ({deficiencies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {deficiencies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
              <p>No deficiency reports</p>
              <p className="text-sm mt-2">
                Your institution has no outstanding deficiencies
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deficiencies.map((deficiency) => (
                <div
                  key={deficiency.id}
                  className="p-4 border rounded-lg"
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
                        <p className="text-sm mt-2">{deficiency.description}</p>
                        {deficiency.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {format(new Date(deficiency.dueDate), "PPP")}
                          </p>
                        )}
                        {deficiency.response && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <p className="font-medium text-blue-800">Your Response:</p>
                            <p className="text-blue-700">{deficiency.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={STATUS_COLORS[deficiency.status]}>
                        {deficiency.status}
                      </Badge>
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





