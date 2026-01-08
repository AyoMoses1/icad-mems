"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ClipboardCheck,
  Building2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  Play,
  X,
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
  getAudits,
  createAudit,
  updateAudit,
  type AuditDto,
  type CreateAuditRequest,
  AUDIT_TYPE,
  AUDIT_STATUS,
} from "@/lib/services/audit-service";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  SCHEDULED: <Clock className="h-4 w-4" />,
  IN_PROGRESS: <Play className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <X className="h-4 w-4" />,
};

export default function AuditsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [audits, setAudits] = useState<AuditDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating new audit
  const [newAudit, setNewAudit] = useState<CreateAuditRequest>({
    institutionId: "",
    scheduledDate: "",
    auditType: AUDIT_TYPE.FOLLOW_UP,
    reason: "",
  });

  useEffect(() => {
    loadAudits();
  }, [statusFilter]);

  const loadAudits = async () => {
    try {
      setIsLoading(true);
      const response = await getAudits({
        status: statusFilter || undefined,
        pageSize: 100,
      });
      if (response.success) {
        setAudits(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load audits:", error);
      toast.error("Failed to load audits");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudit = async () => {
    if (!newAudit.institutionId || !newAudit.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createAudit(newAudit);
      if (response.success) {
        toast.success("Audit scheduled successfully");
        setIsDialogOpen(false);
        setNewAudit({
          institutionId: "",
          scheduledDate: "",
          auditType: AUDIT_TYPE.FOLLOW_UP,
          reason: "",
        });
        loadAudits();
      } else {
        toast.error(response.message || "Failed to schedule audit");
      }
    } catch (error) {
      console.error("Failed to create audit:", error);
      toast.error("Failed to schedule audit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      !searchTerm ||
      audit.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.reason?.toLowerCase().includes(searchTerm.toLowerCase());
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
        title="Follow-up Audits"
        description="Schedule and manage follow-up audits for institutions"
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audits..."
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
              {Object.entries(AUDIT_STATUS).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {key.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Follow-up Audit</DialogTitle>
              <DialogDescription>
                Schedule a follow-up audit for an institution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution ID *</Label>
                <Input
                  id="institutionId"
                  placeholder="Enter institution ID"
                  value={newAudit.institutionId}
                  onChange={(e) =>
                    setNewAudit({ ...newAudit, institutionId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newAudit.scheduledDate}
                  onChange={(e) =>
                    setNewAudit({ ...newAudit, scheduledDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Audit Type</Label>
                <Select
                  value={newAudit.auditType}
                  onValueChange={(value) =>
                    setNewAudit({ ...newAudit, auditType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AUDIT_TYPE).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Reason for the audit..."
                  rows={3}
                  value={newAudit.reason || ""}
                  onChange={(e) =>
                    setNewAudit({ ...newAudit, reason: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAudit} disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Audit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Audits List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Audits ({filteredAudits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAudits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audits found</p>
              <p className="text-sm mt-2">
                Schedule a new follow-up audit to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {audit.institutionName || "Institution Audit"}
                        </p>
                        <Badge variant="outline">{audit.auditType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {audit.scheduledDate
                            ? format(new Date(audit.scheduledDate), "PPP 'at' p")
                            : "Not scheduled"}
                        </span>
                        {audit.inspectorName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {audit.inspectorName}
                          </span>
                        )}
                      </div>
                      {audit.reason && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {audit.reason}
                        </p>
                      )}
                      {audit.findings && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <p className="font-medium">Findings:</p>
                          <p>{audit.findings}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={STATUS_COLORS[audit.status] || "bg-gray-100"}>
                      {STATUS_ICONS[audit.status]}
                      <span className="ml-1">{audit.status}</span>
                    </Badge>
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



